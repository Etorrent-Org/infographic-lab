import hmac
import json
import os
import re
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

PORT = int(os.environ.get("RUNNER_PORT", "7020"))
SHARED_TOKEN = os.environ.get("RUNNER_SHARED_TOKEN", "")
MAX_BODY_BYTES = 600_000
PROMPT_PROTOCOL = "h9-json-envelope-v1"
VIBE_HOME = os.environ.get("VIBE_HOME", os.path.expanduser("~/.vibe"))


def has_mistral_credential() -> bool:
    if os.environ.get("MISTRAL_API_KEY", "").strip():
        return True
    env_file = os.path.join(VIBE_HOME, ".env")
    try:
        with open(env_file, "r", encoding="utf-8") as handle:
            for line in handle:
                if re.match(r"^\s*MISTRAL_API_KEY\s*=\s*.+\S\s*$", line):
                    return True
    except OSError:
        pass
    return False


def strip_fence(value: str) -> str:
    return re.sub(r"\s*```$", "", re.sub(r"^```(?:json)?\s*", "", value.strip(), flags=re.I))


def json_candidates(value: Any):
    if isinstance(value, dict):
        yield value
        priority = ("content", "text", "message", "response", "result", "output", "final")
        for key in priority:
            if key in value:
                yield from json_candidates(value[key])
        for key, child in value.items():
            if key not in priority:
                yield from json_candidates(child)
    elif isinstance(value, list):
        for child in reversed(value):
            yield from json_candidates(child)
    elif isinstance(value, str):
        try:
            parsed = json.loads(strip_fence(value))
        except json.JSONDecodeError:
            return
        yield from json_candidates(parsed)


def extract_result(stdout: str, schema: dict[str, Any]) -> dict[str, Any]:
    parsed = json.loads(stdout)
    expected = set((schema.get("properties") or {}).keys())
    required = set(schema.get("required") or [])
    for candidate in json_candidates(parsed):
        if isinstance(candidate, dict):
            keys = set(candidate.keys())
            if required.issubset(keys) and keys.issubset(expected):
                return candidate
    raise ValueError("Aucun objet JSON métier trouvé dans la sortie Vibe.")


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
    server_version = "InfographicVibeRunner/1.0"

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
        if self.path == "/health":
            configured = has_mistral_credential()
            self.send_json(200 if configured else 503, {
                "status": "ok" if configured else "configuration-required",
                "provider": "vibe",
                "configured": configured,
            })
        else:
            self.send_json(404, {"error": "Route introuvable."})

    def do_POST(self) -> None:
        if self.path != "/generate":
            self.send_json(404, {"error": "Route introuvable."})
            return
        provided = re.sub(r"^Bearer\s+", "", self.headers.get("authorization", ""), flags=re.I)
        if not provided or not hmac.compare_digest(provided, SHARED_TOKEN):
            self.send_json(401, {"error": "Non autorisé."})
            return
        if not has_mistral_credential():
            self.send_json(503, {"error": "Mistral Vibe n'est pas configuré. Renseignez MISTRAL_API_KEY ou un profil Vibe existant."})
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
        completed = subprocess.run(
            [
                "vibe",
                "--prompt",
                body["prompt"],
                "--max-turns",
                "1",
                "--output",
                "json",
                "--agent",
                "infographic-json",
                "--trust",
            ],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
            env=os.environ.copy(),
        )
        if completed.returncode != 0:
            raise RuntimeError(
                "Vibe a quitté avec le code "
                + str(completed.returncode)
                + " : "
                + completed.stderr[-4000:]
            )
        data = extract_result(completed.stdout, body["outputSchema"])
        return {
            "requestId": body["requestId"],
            "provider": "vibe",
            "data": data,
            "durationMs": int((time.monotonic() - started) * 1000),
        }


if __name__ == "__main__":
    print("Runner Vibe Infographic 1.0 prêt sur le port " + str(PORT), flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
