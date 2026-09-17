import hmac
import json
import os
import re
import shutil
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

PORT = int(os.environ.get("RUNNER_PORT", "7030"))
SHARED_TOKEN = os.environ.get("RUNNER_SHARED_TOKEN", "")
MAX_BODY_BYTES = 600_000
PROMPT_PROTOCOL = "h9-json-envelope-v1"
CODEX_HOME = os.environ.get("CODEX_HOME", os.path.expanduser("~/.codex"))
WORK_DIR = os.environ.get("CODEX_WORK_DIR", "/work")


def auth_present() -> bool:
    return os.path.exists(os.path.join(CODEX_HOME, "auth.json")) or bool(os.environ.get("CODEX_ACCESS_TOKEN", "").strip())


def strip_fence(value: str) -> str:
    return re.sub(r"\s*```$", "", re.sub(r"^```(?:json)?\s*", "", value.strip(), flags=re.I))


def parse_candidate(value: str) -> Any:
    clean = strip_fence(value)
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        start = clean.find("{")
        end = clean.rfind("}")
        if start >= 0 and end > start:
            return json.loads(clean[start : end + 1])
        raise


def extract_result(stdout: str, schema: dict[str, Any]) -> dict[str, Any]:
    candidate = parse_candidate(stdout)
    if not isinstance(candidate, dict):
        raise ValueError("La sortie Codex ne contient pas d'objet JSON métier.")
    expected = set((schema.get("properties") or {}).keys())
    required = set(schema.get("required") or [])
    keys = set(candidate.keys())
    if not required.issubset(keys) or not keys.issubset(expected):
        raise ValueError("L'objet JSON Codex ne respecte pas le contrat demandé.")
    return candidate


def validate_prompt_envelope(body: dict[str, Any]) -> None:
    if body.get("promptProtocol") != PROMPT_PROTOCOL:
        raise ValueError("Protocole de prompt non supporté.")
    envelope = json.loads(body["prompt"])
    if (
        envelope.get("protocol") != PROMPT_PROTOCOL
        or not isinstance(envelope.get("trustedInstructions"), dict)
        or not isinstance(envelope.get("untrustedData"), dict)
        or not isinstance(envelope.get("outputContract"), dict)
    ):
        raise ValueError("Enveloppe de prompt invalide.")


class Handler(BaseHTTPRequestHandler):
    server_version = "InfographicCodexRunner/1.0"

    def log_message(self, format_string: str, *args: Any) -> None:
        print(format_string % args, flush=True)

    def send_json(self, status: int, body: dict[str, Any]) -> None:
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self) -> None:
        if self.path != "/health":
            self.send_json(404, {"error": "Route introuvable."})
            return
        cli_present = shutil.which("codex") is not None
        configured = cli_present and auth_present()
        self.send_json(200 if configured else 503, {
            "status": "ok" if configured else "configuration-required",
            "provider": "codex",
            "configured": configured,
            "cli": cli_present,
            "auth": auth_present(),
        })

    def do_POST(self) -> None:
        if self.path != "/generate":
            self.send_json(404, {"error": "Route introuvable."})
            return
        provided = re.sub(r"^Bearer\s+", "", self.headers.get("authorization", ""), flags=re.I)
        if not provided or not hmac.compare_digest(provided, SHARED_TOKEN):
            self.send_json(401, {"error": "Non autorisé."})
            return
        if shutil.which("codex") is None:
            self.send_json(503, {"error": "Codex CLI est absent du runner."})
            return
        if not auth_present():
            self.send_json(503, {"error": "Codex n'est pas authentifié. Lancez codex login --device-auth avec le volume CODEX_HOME."})
            return
        try:
            length = int(self.headers.get("content-length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("Taille de requête invalide.")
            body = json.loads(self.rfile.read(length))
            self.send_json(200, self.generate(body))
        except Exception as error:
            self.send_json(500, {"error": str(error)[:5000]})

    def generate(self, body: dict[str, Any]) -> dict[str, Any]:
        if not body.get("requestId") or not body.get("prompt") or not body.get("outputSchema"):
            raise ValueError("requestId, prompt et outputSchema sont obligatoires.")
        validate_prompt_envelope(body)
        timeout_seconds = min(max(int(body.get("timeoutMs", 120_000)) // 1000, 10), 180)
        started = time.monotonic()
        prompt = (
            "Réponds uniquement avec l'objet JSON final conforme à outputContract. "
            "N'utilise aucun outil, ne lis aucun fichier et n'ajoute aucun commentaire hors JSON.\n\n"
            + body["prompt"]
        )
        completed = subprocess.run(
            [
                "codex",
                "exec",
                "--ephemeral",
                "--skip-git-repo-check",
                "--sandbox",
                "read-only",
                prompt,
            ],
            cwd=WORK_DIR,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
            env={**os.environ, "CODEX_HOME": CODEX_HOME},
        )
        if completed.returncode != 0:
            raise RuntimeError(
                "Codex a quitté avec le code "
                + str(completed.returncode)
                + " : "
                + completed.stderr[-4000:]
            )
        data = extract_result(completed.stdout, body["outputSchema"])
        return {
            "requestId": body["requestId"],
            "provider": "codex",
            "data": data,
            "durationMs": int((time.monotonic() - started) * 1000),
        }


if __name__ == "__main__":
    os.makedirs(WORK_DIR, exist_ok=True)
    print("Runner Codex Infographic prêt sur le port " + str(PORT), flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
