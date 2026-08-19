import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3091);
const VIBE_RUNNER_URL = String(process.env.VIBE_RUNNER_URL ?? "http://vibe-runner:7020").replace(/\/$/, "");
const RUNNER_SHARED_TOKEN = String(process.env.RUNNER_SHARED_TOKEN ?? "");
const DIST_DIR = fileURLToPath(new URL("./dist/", import.meta.url));
const MAX_INPUT_BYTES = 64_000;
const PROMPT_PROTOCOL = "h9-json-envelope-v1";

const itemOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 60 },
    description: { type: "string", minLength: 1, maxLength: 180 },
  },
};

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "layout", "items"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 120 },
    subtitle: { type: "string", maxLength: 180 },
    layout: { type: "string", enum: ["process", "comparison", "timeline", "list"] },
    items: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: itemOutputSchema,
    },
  },
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) throw new Error("Requête trop volumineuse.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Entrée invalide.");
  const text = typeof value.text === "string" ? value.text.trim() : "";
  if (text.length < 10 || text.length > 12000) throw new Error("Le texte doit contenir entre 10 et 12000 caractères.");
  const type = ["auto", "process", "comparison", "timeline", "list"].includes(value.type) ? value.type : "auto";
  const supportedStyles = ["clean", "soft", "dark", "sketch", "chalk", "zen", "pro", "minimal", "tech"];
  const style = supportedStyles.includes(value.style) ? value.style : "clean";
  return { text, type, style, language: "fr" };
}

function buildPrompt(input) {
  return JSON.stringify({
    protocol: PROMPT_PROTOCOL,
    trustedInstructions: {
      runtime: [
        "Transforme uniquement le texte fourni en une structure d'infographie fidèle, synthétique et directement lisible.",
        "N'invente ni CSS, ni HTML, ni JavaScript, ni SVG.",
        "Respecte strictement le schéma de sortie et les limites de longueur.",
        "Conçois pour un visuel et non pour un document : privilégie 3 à 6 items, un titre court par item et une seule phrase très courte de description.",
        "Vise environ 2 à 5 mots par titre d'item et au plus 90 caractères par description.",
        "Le titre principal doit être bref et le sous-titre facultatif doit tenir sur une seule ligne.",
        "N'ajoute aucune URL, date, seuil, prix, statistique, organisme, obligation réglementaire ou autre précision factuelle absente du texte source.",
        "Si le texte demande un mode d'emploi sans fournir de détails vérifiables, reste générique et actionnable au lieu d'inventer des précisions.",
        "Si requestedType vaut auto, choisis le layout le plus adapté parmi process, comparison, timeline et list.",
        "Si requestedType n'est pas auto, retourne exactement ce layout.",
        "Pour comparison, retourne exactement deux items : un item par option comparée, avec un titre distinctif et une synthèse courte.",
        "Pour timeline, ordonne les items chronologiquement ou logiquement du premier au dernier jalon.",
        "Pour process, ordonne les items dans l'ordre d'exécution et commence les titres par une action claire quand c'est naturel.",
        "Pour list, conserve uniquement les idées réellement distinctes et fusionne les doublons.",
        "Le style visuel est géré par l'application et ne doit pas apparaître dans la sortie.",
      ],
      application: "Infographic Lab",
    },
    untrustedData: {
      text: input.text,
      requestedType: input.type,
      language: input.language,
    },
    outputContract: outputSchema,
  }, null, 2);
}

function buildItemPrompt(input) {
  return JSON.stringify({
    protocol: PROMPT_PROTOCOL,
    trustedInstructions: {
      runtime: [
        "Réécris uniquement l'élément ciblé de l'infographie.",
        "Retourne strictement un objet avec title et description ; ne retourne jamais l'infographie complète.",
        "Conserve le rôle logique de cet élément dans le layout existant et évite de dupliquer les autres éléments.",
        "Utilise sourceText comme seule source factuelle. N'ajoute aucune information, date, chiffre, URL, organisme ou obligation absente de cette source.",
        "Respecte l'instruction utilisateur lorsqu'elle est compatible avec la source et le contexte.",
        "Si l'instruction est vide, améliore surtout la clarté, la concision et la lisibilité visuelle.",
        "Vise environ 2 à 5 mots pour title et au plus 90 caractères pour description.",
        "Pour un process ou une timeline, garde la continuité avec les étapes voisines.",
        "Pour une comparison, conserve l'identité de l'option ciblée.",
        "N'invente ni CSS, ni HTML, ni JavaScript, ni SVG.",
      ],
      application: "Infographic Lab · Retouche ciblée",
    },
    untrustedData: {
      sourceText: input.sourceText,
      infographic: input.infographic,
      targetIndex: input.itemIndex,
      targetItem: input.infographic.items[input.itemIndex],
      userInstruction: input.instruction || null,
      language: "fr",
    },
    outputContract: itemOutputSchema,
  }, null, 2);
}

function validText(value, min, max) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function validateItemOutput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Élément Vibe invalide.");
  if (Object.keys(value).some((key) => !["title", "description"].includes(key))) throw new Error("Élément Vibe non conforme.");
  if (!validText(value.title, 1, 60) || !validText(value.description, 1, 180)) throw new Error("Contenu Vibe invalide.");
  return value;
}

function validateOutput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Réponse Vibe invalide.");
  const keys = Object.keys(value);
  if (keys.some((key) => !["title", "subtitle", "layout", "items"].includes(key))) throw new Error("Réponse Vibe non conforme.");
  if (!validText(value.title, 1, 120)) throw new Error("Titre Vibe invalide.");
  if (value.subtitle !== undefined && !validText(value.subtitle, 0, 180)) throw new Error("Sous-titre Vibe invalide.");
  if (!["process", "comparison", "timeline", "list"].includes(value.layout)) throw new Error("Layout Vibe invalide.");
  if (!Array.isArray(value.items) || value.items.length < 2 || value.items.length > 8) throw new Error("Nombre d'éléments Vibe invalide.");
  if (value.layout === "comparison" && value.items.length !== 2) throw new Error("Une comparaison doit contenir exactement deux options.");
  for (const item of value.items) validateItemOutput(item);
  return value;
}

function validateRegenerateItemInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Entrée de retouche invalide.");
  if (Object.keys(value).some((key) => !["sourceText", "infographic", "itemIndex", "instruction"].includes(key))) {
    throw new Error("Entrée de retouche non conforme.");
  }
  const sourceText = typeof value.sourceText === "string" ? value.sourceText.trim() : "";
  if (sourceText.length < 10 || sourceText.length > 12000) {
    throw new Error("Le texte source doit contenir entre 10 et 12000 caractères.");
  }
  const infographic = validateOutput(value.infographic);
  const itemIndex = value.itemIndex;
  if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= infographic.items.length) {
    throw new Error("Index de bloc invalide.");
  }
  const instruction = typeof value.instruction === "string" ? value.instruction.trim() : "";
  if (instruction.length > 500) throw new Error("L'instruction de retouche est trop longue.");
  return { sourceText, infographic, itemIndex, instruction };
}

async function generate(req, res) {
  if (!RUNNER_SHARED_TOKEN) return sendJson(res, 503, { error: "Runner Vibe non configuré." });
  try {
    const input = validateInput(await readJson(req));
    const requestId = crypto.randomUUID();
    const response = await fetch(`${VIBE_RUNNER_URL}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${RUNNER_SHARED_TOKEN}` },
      body: JSON.stringify({
        requestId,
        prompt: buildPrompt(input),
        promptProtocol: PROMPT_PROTOCOL,
        outputSchema,
        timeoutMs: 120000,
      }),
      signal: AbortSignal.timeout(125000),
    });
    const body = await response.json();
    if (!response.ok) return sendJson(res, 502, { error: body.error ?? "Le runner Vibe a échoué." });
    const data = validateOutput(body.data);
    if (input.type !== "auto" && data.layout !== input.type) {
      throw new Error(`Vibe a retourné le layout ${data.layout} au lieu de ${input.type}.`);
    }
    return sendJson(res, 200, {
      data,
      provider: body.provider ?? "vibe",
      durationMs: body.durationMs,
      style: input.style,
    });
  } catch (error) {
    return sendJson(res, 400, { error: String(error?.message ?? error).slice(0, 1000) });
  }
}

async function regenerateItem(req, res) {
  if (!RUNNER_SHARED_TOKEN) return sendJson(res, 503, { error: "Runner Vibe non configuré." });
  try {
    const input = validateRegenerateItemInput(await readJson(req));
    const requestId = crypto.randomUUID();
    const response = await fetch(`${VIBE_RUNNER_URL}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${RUNNER_SHARED_TOKEN}` },
      body: JSON.stringify({
        requestId,
        prompt: buildItemPrompt(input),
        promptProtocol: PROMPT_PROTOCOL,
        outputSchema: itemOutputSchema,
        timeoutMs: 120000,
      }),
      signal: AbortSignal.timeout(125000),
    });
    const body = await response.json();
    if (!response.ok) return sendJson(res, 502, { error: body.error ?? "Le runner Vibe a échoué." });
    const data = validateItemOutput(body.data);
    return sendJson(res, 200, {
      data,
      provider: body.provider ?? "vibe",
      durationMs: body.durationMs,
    });
  } catch (error) {
    return sendJson(res, 400, { error: String(error?.message ?? error).slice(0, 1000) });
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

function serveStatic(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const safePath = normalize(pathname).replace(/^([.][.][/\\])+/, "");
  let file = join(DIST_DIR, safePath === "/" ? "index.html" : safePath);
  if (!file.startsWith(DIST_DIR)) return sendJson(res, 404, { error: "Introuvable." });
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST_DIR, "index.html");
  const stat = statSync(file);
  res.writeHead(200, {
    "content-type": mimeTypes[extname(file)] ?? "application/octet-stream",
    "content-length": stat.size,
    "x-content-type-options": "nosniff",
  });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") return sendJson(res, 200, { status: "ok", version: "1.0.0" });
  if (req.method === "POST" && req.url === "/api/generate") return generate(req, res);
  if (req.method === "POST" && req.url === "/api/regenerate-item") return regenerateItem(req, res);
  if (req.method === "GET") return serveStatic(req, res);
  return sendJson(res, 405, { error: "Méthode non autorisée." });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Infographic Lab 1.0.0 prêt sur le port ${PORT}`);
});
