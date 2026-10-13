import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function requestJson(url, body) {
  const response = await fetch(url, body === undefined ? {} : {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  return data;
}

test("Ollama est utilisable pour generation, retouche et controle qualite", async () => {
  const requests = [];
  const model = "qwen3.5:4b-q4_K_M";
  const sourceText = "Le texte est reçu puis il est structuré et exporté en SVG.";
  const mock = createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/api/tags") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ models: [{ name: model }] }));
        return;
      }
      assert.equal(req.method, "POST");
      assert.equal(req.url, "/api/generate");
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      requests.push(body);
      assert.equal(body.model, model);
      assert.equal(body.stream, false);
      assert.equal(body.think, false);
      assert.equal(typeof body.format, "object");
      assert.equal(body.options.temperature, 0);
      const required = body.format.required ?? [];
      let output;
      if (required.includes("items")) {
        output = {
          title: "Flux d'une infographie",
          layout: "process",
          items: [
            { title: "Reception", description: "Le texte est reçu.", blockType: "process", claimType: "fact", evidence: "Le texte est reçu" },
            { title: "Export", description: "L'infographie est exportée en SVG.", blockType: "process", claimType: "fact", evidence: "exporté en SVG" },
          ],
        };
      } else if (required.includes("score")) {
        output = { score: 92, summary: "Le processus est clair.", issues: [] };
      } else {
        assert.equal(required.includes("blockType"), true);
        output = {
          title: "Reception",
          description: "Le texte est reçu.",
          blockType: "process",
          claimType: "fact",
          evidence: "Le texte est reçu",
        };
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ response: JSON.stringify(output), total_duration: 1200000000 }));
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: String(error) }));
    }
  });
  mock.listen(0, "127.0.0.1");
  await once(mock, "listening");
  const mockPort = mock.address().port;
  const appPort = await availablePort();
  const app = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(appPort),
      OLLAMA_URL: "http://127.0.0.1:" + mockPort,
      OLLAMA_MODEL: model,
      AI_PROVIDER_ORDER: "ollama",
      VIBE_RUNNER_URL: "",
      CODEX_RUNNER_URL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let diagnostics = "";
  for (const stream of [app.stdout, app.stderr]) {
    stream.on("data", (chunk) => { diagnostics += chunk.toString(); });
  }
  try {
    const base = "http://127.0.0.1:" + appPort;
    let ready = false;
    for (let i = 0; i < 80; i++) {
      if (app.exitCode !== null) break;
      try {
        const response = await fetch(base + "/health", { signal: AbortSignal.timeout(500) });
        if (response.ok) { ready = true; break; }
      } catch { /* server is still starting */ }
      await sleep(100);
    }
    assert.ok(ready, "Le serveur n'a pas demarre : " + diagnostics);
    const status = await requestJson(base + "/api/providers");
    const ollama = status.providers.find((item) => item.id === "ollama");
    assert.equal(ollama?.available, true);
    assert.equal(ollama?.detail, "Prêt");

    const generated = await requestJson(base + "/api/generate", {
      text: sourceText,
      type: "process",
      style: "clean",
      language: "fr",
      intent: "explain",
      provider: "auto",
    });
    assert.equal(generated.provider, "ollama");
    assert.equal(generated.data.layout, "process");
    assert.equal(generated.data.items.length, 2);
    assert.equal(generated.data.items[0].claimType, "fact");
    assert.equal(generated.warnings.length, 0);

    const retouch = await requestJson(base + "/api/regenerate-item", {
      sourceText,
      infographic: generated.data,
      itemIndex: 0,
      instruction: "Raccourcir",
      provider: "ollama",
    });
    assert.equal(retouch.provider, "ollama");
    assert.equal(retouch.data.title, "Reception");

    const review = await requestJson(base + "/api/review", {
      sourceText,
      infographic: generated.data,
      intent: "explain",
      provider: "ollama",
    });
    assert.equal(review.provider, "ollama");
    assert.equal(review.data.score, 92);
    assert.equal(requests.length, 3);
  } finally {
    app.kill("SIGTERM");
    await new Promise((resolve) => mock.close(resolve));
  }
});
