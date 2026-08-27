import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3091);
const RUNNER_SHARED_TOKEN = String(process.env.RUNNER_SHARED_TOKEN ?? "");
const VIBE_RUNNER_URL = String(process.env.VIBE_RUNNER_URL ?? "http://vibe-runner:7020").replace(/\/$/, "");
const CODEX_RUNNER_URL = String(process.env.CODEX_RUNNER_URL ?? "").replace(/\/$/, "");
const VIBE_RUNNER_TOKEN = String(process.env.VIBE_RUNNER_TOKEN ?? RUNNER_SHARED_TOKEN);
const CODEX_RUNNER_TOKEN = String(process.env.CODEX_RUNNER_TOKEN ?? RUNNER_SHARED_TOKEN);
const AI_PROVIDER_ORDER = String(process.env.AI_PROVIDER_ORDER ?? "vibe,codex")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter((value) => value === "vibe" || value === "codex");
const DIST_DIR = fileURLToPath(new URL("./dist/", import.meta.url));
const MAX_INPUT_BYTES = 96_000;
const PROMPT_PROTOCOL = "h9-json-envelope-v1";

const blockTypes = ["process", "timeline", "comparison", "list", "cycle", "matrix", "architecture", "summary"];
const claimTypes = ["fact", "interpretation", "suggestion"];
const intentTypes = ["explain", "decide", "convince", "train", "summarize"];
const providerTypes = ["auto", "vibe", "codex"];
const orientations = ["auto", "portrait", "landscape", "square"];
const detailLevels = ["summary", "balanced", "detailed"];
const wordingModes = ["rephrase", "close"];
const visualTargets = [
  "auto", "iceberg", "cycle", "sankey", "matrix", "architecture", "hub", "table", "kpi",
  "tree", "venn", "swot", "impact", "eisenhower", "risk", "bar", "column", "line", "donut", "waterfall",
];

const itemOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "blockType", "claimType"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 60 },
    description: { type: "string", minLength: 1, maxLength: 180 },
    blockType: { type: "string", enum: blockTypes },
    claimType: { type: "string", enum: claimTypes },
    evidence: { type: "string", minLength: 1, maxLength: 260 },
    value: { type: "number" },
    unit: { type: "string", minLength: 1, maxLength: 24 },
    category: { type: "string", minLength: 1, maxLength: 40 },
    series: { type: "string", minLength: 1, maxLength: 40 },
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
    items: { type: "array", minItems: 2, maxItems: 8, items: itemOutputSchema },
  },
};

const qualityIssueSchema = {
  type: "object",
  additionalProperties: false,
  required: ["severity", "category", "message"],
  properties: {
    severity: { type: "string", enum: ["warning", "info"] },
    category: { type: "string", enum: ["readability", "structure", "content", "sources"] },
    message: { type: "string", minLength: 1, maxLength: 240 },
    itemIndex: { type: "integer", minimum: 0, maximum: 7 },
    suggestion: { type: "string", maxLength: 240 },
    proposedTitle: { type: "string", maxLength: 60 },
    proposedDescription: { type: "string", maxLength: 180 },
  },
};

const qualitySchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "summary", "issues"],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string", minLength: 1, maxLength: 260 },
    issues: { type: "array", maxItems: 8, items: qualityIssueSchema },
  },
};

const intentRules = {
  explain: "Structure le contenu pour rendre le sujet immédiatement compréhensible : hiérarchie claire, vocabulaire simple, progression pédagogique.",
  decide: "Structure le contenu pour faciliter une décision : options, critères, risques, points d'attention et conclusion actionnable lorsque la source le permet.",
  convince: "Structure le contenu pour soutenir un message : bénéfices, problème résolu, preuves présentes dans la source et différenciation sans inventer de faits.",
  train: "Structure le contenu pour apprendre : séquence logique, notions clés, étapes et formulations pédagogiques.",
  summarize: "Conserve seulement l'essentiel : élimine les répétitions, hiérarchise les messages clés et garde une densité faible.",
};

const detailRules = {
  summary: "Vise 3 à 4 blocs, titres très courts et descriptions d'une phrase brève.",
  balanced: "Vise 3 à 6 blocs avec un bon équilibre entre synthèse et contexte.",
  detailed: "Vise 5 à 8 blocs uniquement si la source contient assez de matière ; reste lisible et évite les répétitions.",
};

const visualRules = {
  auto: "Choisis une structure générique adaptée au contenu.",
  iceberg: "Prépare idéalement 4 à 6 items : 1 à 2 symptômes visibles puis les causes, mécanismes ou leviers plus profonds.",
  cycle: "Prépare 3 à 7 étapes qui forment réellement une boucle.",
  sankey: "Prépare 3 à 7 étapes d'un flux narratif. Ne prétends pas encoder les largeurs quantitativement.",
  matrix: "Prépare exactement 4 axes compatibles avec une matrice 2×2.",
  swot: "Prépare exactement 4 items dans cet ordre : Forces, Faiblesses, Opportunités, Menaces, en restant fidèle à la source.",
  impact: "Prépare exactement 4 items utiles à une lecture Impact / Effort sans inventer de score chiffré.",
  eisenhower: "Prépare exactement 4 items utiles aux quadrants Faire, Planifier, Déléguer, Éliminer.",
  risk: "Prépare exactement 4 items utiles à une matrice de risque ; n'invente aucune probabilité ni gravité absente de la source.",
  architecture: "Prépare 3 à 6 couches ou niveaux cohérents, du socle vers le sommet.",
  hub: "Prépare 3 à 6 idées satellites autour du sujet central.",
  tree: "Prépare 3 à 7 branches de premier niveau pour une hiérarchie lisible.",
  venn: "Prépare 2 ou 3 ensembles comparables avec leurs idées distinctives ; ne fabrique pas d'intersection absente de la source.",
  table: "Prépare 3 à 7 lignes comparables et concises.",
  kpi: "Préserve uniquement les indicateurs numériques explicitement présents dans la source et renseigne value et unit quand ils sont disponibles.",
  bar: "Préserve les valeurs numériques explicites dans value, avec unit/category/series si présents. N'invente jamais une valeur manquante.",
  column: "Préserve les valeurs numériques explicites dans value, avec unit/category/series si présents. N'invente jamais une valeur manquante.",
  line: "Préserve les valeurs numériques explicites dans value dans un ordre temporel ou séquentiel fidèle à la source.",
  donut: "Préserve uniquement des valeurs positives explicitement présentes dans la source ; n'invente aucune part.",
  waterfall: "Préserve les variations numériques explicites dans value, positives ou négatives, dans l'ordre de la source.",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
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

function providerConfig(id) {
  if (id === "vibe") return { id, label: "Mistral Vibe", url: VIBE_RUNNER_URL, token: VIBE_RUNNER_TOKEN };
  if (id === "codex") return { id, label: "OpenAI Codex", url: CODEX_RUNNER_URL, token: CODEX_RUNNER_TOKEN };
  return null;
}

function providerConfigured(id) {
  const provider = providerConfig(id);
  return Boolean(provider?.url && provider?.token);
}

async function providerHealth(id) {
  const provider = providerConfig(id);
  if (!providerConfigured(id) || !provider) return { configured: false, available: false, detail: "Non configuré" };
  try {
    const response = await fetch(`${provider.url}/health`, { signal: AbortSignal.timeout(1800) });
    const body = await response.json().catch(() => ({}));
    return {
      configured: true,
      available: response.ok && body.configured !== false,
      detail: response.ok ? (body.configured === false ? "Authentification requise" : "Prêt") : "Indisponible",
    };
  } catch {
    return { configured: true, available: false, detail: "Runner inaccessible" };
  }
}

async function providersStatus(_req, res) {
  const ids = ["vibe", "codex"];
  const providers = await Promise.all(ids.map(async (id) => {
    const config = providerConfig(id);
    const health = await providerHealth(id);
    return { id, label: config.label, ...health };
  }));
  return sendJson(res, 200, { providers });
}

function providerCandidates(requested) {
  if (requested !== "auto") return [requested];
  const ordered = [...AI_PROVIDER_ORDER, "vibe", "codex"];
  return [...new Set(ordered)].filter((id) => providerConfigured(id));
}

async function callProvider(id, prompt, schema, timeoutMs = 120000) {
  const provider = providerConfig(id);
  if (!provider || !providerConfigured(id)) throw new Error(`Moteur ${id} non configuré.`);
  const requestId = crypto.randomUUID();
  const response = await fetch(`${provider.url}/generate`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${provider.token}` },
    body: JSON.stringify({ requestId, prompt, promptProtocol: PROMPT_PROTOCOL, outputSchema: schema, timeoutMs }),
    signal: AbortSignal.timeout(timeoutMs + 5000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `Le runner ${provider.label} a échoué.`);
  return { ...body, provider: body.provider ?? id };
}

async function runWithProvider(requested, prompt, schema, timeoutMs = 120000) {
  const candidates = providerCandidates(requested);
  if (!candidates.length) throw new Error("Aucun moteur IA n'est configuré.");
  const errors = [];
  for (const id of candidates) {
    try {
      return await callProvider(id, prompt, schema, timeoutMs);
    } catch (error) {
      errors.push(`${id}: ${String(error?.message ?? error)}`);
      if (requested !== "auto") break;
    }
  }
  throw new Error(`Aucun moteur IA n'a répondu. ${errors.join(" | ")}`);
}

function normalizePreferences(value) {
  const preferences = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    orientation: orientations.includes(preferences.orientation) ? preferences.orientation : "auto",
    detail: detailLevels.includes(preferences.detail) ? preferences.detail : "balanced",
    wording: wordingModes.includes(preferences.wording) ? preferences.wording : "rephrase",
    visual: visualTargets.includes(preferences.visual) ? preferences.visual : "auto",
  };
}

function validateInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Entrée invalide.");
  const text = typeof value.text === "string" ? value.text.trim() : "";
  if (text.length < 10 || text.length > 12000) throw new Error("Le texte doit contenir entre 10 et 12000 caractères.");
  const type = ["auto", "process", "comparison", "timeline", "list"].includes(value.type) ? value.type : "auto";
  const supportedStyles = ["clean", "soft", "dark", "sketch", "chalk", "zen", "pro", "minimal", "tech"];
  const style = supportedStyles.includes(value.style) ? value.style : "clean";
  const intent = intentTypes.includes(value.intent) ? value.intent : "explain";
  const provider = providerTypes.includes(value.provider) ? value.provider : "auto";
  return { text, type, style, language: "fr", intent, provider, preferences: normalizePreferences(value.preferences) };
}

function buildPrompt(input) {
  const wordingRule = input.preferences.wording === "close"
    ? "Reste aussi proche que possible du vocabulaire et des formulations du texte source ; raccourcis seulement ce qui est nécessaire pour la lisibilité."
    : "Tu peux reformuler le texte pour le rendre plus clair et plus concis sans en changer le sens ni ajouter de faits.";
  return JSON.stringify({
    protocol: PROMPT_PROTOCOL,
    trustedInstructions: {
      runtime: [
        "Transforme uniquement le texte fourni en un modèle d'idée fidèle, synthétique et directement visualisable.",
        intentRules[input.intent],
        detailRules[input.preferences.detail],
        wordingRule,
        visualRules[input.preferences.visual],
        "N'invente ni CSS, ni HTML, ni JavaScript, ni SVG.",
        "Respecte strictement le schéma de sortie et les limites de longueur.",
        "N'ajoute aucune URL, date, seuil, prix, statistique, organisme ou obligation absente du texte source.",
        "Quand une donnée numérique explicite est utile au visuel, copie sa valeur numérique dans value et son unité dans unit. Utilise category et series seulement si la source les établit clairement.",
        "Ne déduis jamais une valeur numérique à partir d'une formulation vague et ne complète jamais une série incomplète par invention.",
        "Pour chaque item, choisis blockType parmi process, timeline, comparison, list, cycle, matrix, architecture, summary.",
        "Pour chaque item, choisis claimType : fact uniquement si le contenu est explicitement présent dans la source, interpretation pour une reformulation ou déduction raisonnable, suggestion pour une proposition nouvelle.",
        "Quand claimType vaut fact, ajoute evidence avec un extrait court et exact du texte source. Ne fabrique jamais une citation.",
        "Si requestedType vaut auto, choisis le layout global le plus adapté parmi process, comparison, timeline et list.",
        "Si requestedType n'est pas auto, retourne exactement ce layout.",
        "Pour comparison, retourne exactement deux items.",
        "L'orientation et le style visuel sont gérés localement par l'application et ne doivent pas apparaître dans la sortie.",
      ],
      application: "Infographic Lab Augmented",
    },
    untrustedData: {
      text: input.text,
      requestedType: input.type,
      intent: input.intent,
      language: input.language,
      preferences: input.preferences,
    },
    outputContract: outputSchema,
  }, null, 2);
}

function buildItemPrompt(input) {
  return JSON.stringify({
    protocol: PROMPT_PROTOCOL,
    trustedInstructions: {
      runtime: [
        "Réécris uniquement le bloc ciblé du modèle d'idée.",
        intentRules[input.intent],
        "Retourne strictement un objet conforme au schéma demandé.",
        "Utilise sourceText comme seule source factuelle.",
        "Conserve blockType et claimType sauf si l'instruction demande explicitement de les faire évoluer.",
        "Conserve value, unit, category et series lorsqu'ils existent, sauf demande explicite et seulement si la source justifie la modification.",
        "Quand claimType vaut fact, evidence doit être un extrait exact de sourceText.",
        "N'ajoute aucune information factuelle ou valeur numérique absente de la source.",
        "Vise 2 à 5 mots pour title et au plus 100 caractères pour description.",
      ],
      application: "Infographic Lab Augmented · Retouche",
    },
    untrustedData: {
      sourceText: input.sourceText,
      infographic: input.infographic,
      targetIndex: input.itemIndex,
      targetItem: input.infographic.items[input.itemIndex],
      userInstruction: input.instruction || null,
      intent: input.intent,
      language: "fr",
    },
    outputContract: itemOutputSchema,
  }, null, 2);
}

function buildQualityPrompt(input) {
  return JSON.stringify({
    protocol: PROMPT_PROTOCOL,
    trustedInstructions: {
      runtime: [
        "Évalue ce modèle d'idée comme un contrôleur qualité professionnel, sans ajouter de nouveaux faits.",
        "Contrôle lisibilité, structure, clarté du message et fiabilité des sources.",
        "Le score est un indicateur UX, pas une mesure scientifique.",
        "Signale au maximum huit problèmes réellement utiles.",
        "Si une correction textuelle simple est pertinente, propose proposedTitle et/ou proposedDescription sans changer le sens factuel.",
        "Ne propose jamais une nouvelle statistique, date, source ou preuve.",
      ],
      application: "Infographic Lab Augmented · Quality Gate",
    },
    untrustedData: { sourceText: input.sourceText, infographic: input.infographic, intent: input.intent },
    outputContract: qualitySchema,
  }, null, 2);
}

function validText(value, min, max) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function validateItemOutput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Bloc IA invalide.");
  const allowed = ["title", "description", "blockType", "claimType", "evidence", "value", "unit", "category", "series"];
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new Error("Bloc IA non conforme.");
  if (!validText(value.title, 1, 60) || !validText(value.description, 1, 180)) throw new Error("Contenu IA invalide.");
  if (!blockTypes.includes(value.blockType)) throw new Error("Type de bloc IA invalide.");
  if (!claimTypes.includes(value.claimType)) throw new Error("Statut de contenu IA invalide.");
  if (value.evidence !== undefined && !validText(value.evidence, 1, 260)) throw new Error("Preuve IA invalide.");
  if (value.value !== undefined && (typeof value.value !== "number" || !Number.isFinite(value.value))) throw new Error("Valeur numérique IA invalide.");
  if (value.unit !== undefined && !validText(value.unit, 1, 24)) throw new Error("Unité IA invalide.");
  if (value.category !== undefined && !validText(value.category, 1, 40)) throw new Error("Catégorie IA invalide.");
  if (value.series !== undefined && !validText(value.series, 1, 40)) throw new Error("Série IA invalide.");
  return value;
}

function validateOutput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Réponse IA invalide.");
  if (Object.keys(value).some((key) => !["title", "subtitle", "layout", "items"].includes(key))) throw new Error("Réponse IA non conforme.");
  if (!validText(value.title, 1, 120)) throw new Error("Titre IA invalide.");
  if (value.subtitle !== undefined && !validText(value.subtitle, 0, 180)) throw new Error("Sous-titre IA invalide.");
  if (!["process", "comparison", "timeline", "list"].includes(value.layout)) throw new Error("Layout IA invalide.");
  if (!Array.isArray(value.items) || value.items.length < 2 || value.items.length > 8) throw new Error("Nombre de blocs IA invalide.");
  if (value.layout === "comparison" && value.items.length !== 2) throw new Error("Une comparaison doit contenir exactement deux options.");
  value.items.forEach(validateItemOutput);
  return value;
}

function groundEvidence(sourceText, data) {
  const normalizedSource = sourceText.toLocaleLowerCase("fr");
  const warnings = [];
  data.items = data.items.map((item, index) => {
    if (item.claimType !== "fact") return item;
    const evidence = typeof item.evidence === "string" ? item.evidence.trim() : "";
    if (!evidence || !normalizedSource.includes(evidence.toLocaleLowerCase("fr"))) {
      warnings.push(`Bloc ${index + 1} reclassé en interprétation : preuve exacte introuvable dans la source.`);
      const next = { ...item, claimType: "interpretation" };
      delete next.evidence;
      return next;
    }
    return item;
  });
  return warnings;
}

function visualWarnings(preferences, data) {
  const warnings = [];
  const numericCount = data.items.filter((item) => typeof item.value === "number" && Number.isFinite(item.value)).length;
  if (["bar", "column", "line", "donut", "waterfall", "kpi"].includes(preferences.visual) && numericCount < 2) {
    warnings.push("Le visuel chiffré demandé nécessite au moins deux valeurs numériques explicites dans la source ; les valeurs manquantes n'ont pas été inventées.");
  }
  if (["matrix", "swot", "impact", "eisenhower", "risk"].includes(preferences.visual) && data.items.length !== 4) {
    warnings.push("Le visuel matriciel demandé nécessite exactement quatre blocs ; un rendu compatible restera disponible dans les variantes.");
  }
  if (preferences.visual === "venn" && (data.items.length < 2 || data.items.length > 3)) {
    warnings.push("Le diagramme de Venn demande deux ou trois ensembles ; un rendu compatible restera disponible dans les variantes.");
  }
  return warnings;
}

function validateRegenerateItemInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Entrée de retouche invalide.");
  const sourceText = typeof value.sourceText === "string" ? value.sourceText.trim() : "";
  if (sourceText.length < 10 || sourceText.length > 12000) throw new Error("Le texte source doit contenir entre 10 et 12000 caractères.");
  const infographic = validateOutput(value.infographic);
  const itemIndex = value.itemIndex;
  if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= infographic.items.length) throw new Error("Index de bloc invalide.");
  const instruction = typeof value.instruction === "string" ? value.instruction.trim() : "";
  if (instruction.length > 500) throw new Error("L'instruction de retouche est trop longue.");
  const intent = intentTypes.includes(value.intent) ? value.intent : "explain";
  const provider = providerTypes.includes(value.provider) ? value.provider : "auto";
  return { sourceText, infographic, itemIndex, instruction, intent, provider };
}

function validateQualityInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Entrée de contrôle qualité invalide.");
  const sourceText = typeof value.sourceText === "string" ? value.sourceText.trim() : "";
  if (sourceText.length < 10 || sourceText.length > 12000) throw new Error("Texte source invalide.");
  const infographic = validateOutput(value.infographic);
  const intent = intentTypes.includes(value.intent) ? value.intent : "explain";
  const provider = providerTypes.includes(value.provider) ? value.provider : "auto";
  return { sourceText, infographic, intent, provider };
}

function validateQualityOutput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Contrôle qualité IA invalide.");
  if (!Number.isInteger(value.score) || value.score < 0 || value.score > 100) throw new Error("Score qualité invalide.");
  if (!validText(value.summary, 1, 260)) throw new Error("Résumé qualité invalide.");
  if (!Array.isArray(value.issues) || value.issues.length > 8) throw new Error("Liste de contrôles qualité invalide.");
  for (const issue of value.issues) {
    if (!issue || typeof issue !== "object" || Array.isArray(issue)) throw new Error("Problème qualité invalide.");
    if (!["warning", "info"].includes(issue.severity)) throw new Error("Sévérité qualité invalide.");
    if (!["readability", "structure", "content", "sources"].includes(issue.category)) throw new Error("Catégorie qualité invalide.");
    if (!validText(issue.message, 1, 240)) throw new Error("Message qualité invalide.");
    if (issue.itemIndex !== undefined && (!Number.isInteger(issue.itemIndex) || issue.itemIndex < 0 || issue.itemIndex > 7)) throw new Error("Index qualité invalide.");
    if (issue.proposedTitle !== undefined && !validText(issue.proposedTitle, 1, 60)) throw new Error("Titre proposé invalide.");
    if (issue.proposedDescription !== undefined && !validText(issue.proposedDescription, 1, 180)) throw new Error("Description proposée invalide.");
  }
  return value;
}

async function generate(req, res) {
  try {
    const input = validateInput(await readJson(req));
    const body = await runWithProvider(input.provider, buildPrompt(input), outputSchema);
    const data = validateOutput(body.data);
    if (input.type !== "auto" && data.layout !== input.type) throw new Error(`Le moteur a retourné ${data.layout} au lieu de ${input.type}.`);
    const warnings = [...groundEvidence(input.text, data), ...visualWarnings(input.preferences, data)];
    return sendJson(res, 200, { data, provider: body.provider, durationMs: body.durationMs, style: input.style, warnings });
  } catch (error) {
    return sendJson(res, 400, { error: String(error?.message ?? error).slice(0, 1200) });
  }
}

async function regenerateItem(req, res) {
  try {
    const input = validateRegenerateItemInput(await readJson(req));
    const body = await runWithProvider(input.provider, buildItemPrompt(input), itemOutputSchema);
    const data = validateItemOutput(body.data);
    const wrapper = { title: input.infographic.title, layout: input.infographic.layout, items: [{ ...data }, { ...data }] };
    if (data.claimType === "fact") groundEvidence(input.sourceText, wrapper);
    return sendJson(res, 200, { data: wrapper.items[0], provider: body.provider, durationMs: body.durationMs });
  } catch (error) {
    return sendJson(res, 400, { error: String(error?.message ?? error).slice(0, 1200) });
  }
}

async function review(req, res) {
  try {
    const input = validateQualityInput(await readJson(req));
    const body = await runWithProvider(input.provider, buildQualityPrompt(input), qualitySchema, 90000);
    const data = validateQualityOutput(body.data);
    return sendJson(res, 200, { data, provider: body.provider, durationMs: body.durationMs });
  } catch (error) {
    return sendJson(res, 400, { error: String(error?.message ?? error).slice(0, 1200) });
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
  if (req.method === "GET" && req.url === "/health") return sendJson(res, 200, { status: "ok", version: "augmented-preview" });
  if (req.method === "GET" && req.url === "/api/providers") return providersStatus(req, res);
  if (req.method === "POST" && req.url === "/api/generate") return generate(req, res);
  if (req.method === "POST" && req.url === "/api/regenerate-item") return regenerateItem(req, res);
  if (req.method === "POST" && req.url === "/api/review") return review(req, res);
  if (req.method === "GET") return serveStatic(req, res);
  return sendJson(res, 405, { error: "Méthode non autorisée." });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Infographic Lab Augmented prêt sur le port ${PORT}`);
});
