import type {
  AIProvider,
  BlockKind,
  BrandProfile,
  CanonicalInfographic,
  ClaimKind,
  InfographicKind,
  InfographicStyle,
  QualityIssue,
  QualityReview,
  UsageIntent,
} from "./types";

export const intentOptions: { value: UsageIntent; label: string; hint: string }[] = [
  { value: "explain", label: "Expliquer", hint: "Rendre un sujet clair" },
  { value: "decide", label: "Décider", hint: "Comparer et arbitrer" },
  { value: "convince", label: "Convaincre", hint: "Porter un message" },
  { value: "train", label: "Former", hint: "Transmettre étape par étape" },
  { value: "summarize", label: "Synthétiser", hint: "Condenser l'essentiel" },
];

export const blockOptions: { value: BlockKind; label: string }[] = [
  { value: "process", label: "Process" },
  { value: "timeline", label: "Timeline" },
  { value: "comparison", label: "Comparaison" },
  { value: "list", label: "Liste" },
  { value: "cycle", label: "Cycle" },
  { value: "matrix", label: "Matrice" },
  { value: "architecture", label: "Architecture" },
  { value: "summary", label: "Synthèse" },
];

export const claimOptions: { value: ClaimKind; label: string }[] = [
  { value: "fact", label: "Fait sourcé" },
  { value: "interpretation", label: "Interprétation" },
  { value: "suggestion", label: "Suggestion IA" },
];

export const defaultBrands: BrandProfile[] = [
  {
    id: "infographic-lab",
    name: "Infographic Lab",
    primary: "#172033",
    accent: "#4F7DF3",
    background: "#F5F7FB",
    fontFamily: "system",
    footer: "Infographic Lab",
  },
  {
    id: "executive",
    name: "Executive",
    primary: "#111827",
    accent: "#A76A34",
    background: "#F7F4EF",
    fontFamily: "serif",
    footer: "",
  },
];

export type AugmentedProjectState = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sourceText: string;
  intent: UsageIntent;
  provider: AIProvider;
  type: InfographicKind;
  style: InfographicStyle;
  variantIndex: number;
  brand: BrandProfile;
  infographic: CanonicalInfographic;
};

type ProjectSnapshot = {
  id: string;
  savedAt: string;
  label: string;
  state: Omit<AugmentedProjectState, "createdAt" | "updatedAt">;
};

export type LocalProjectRecord = AugmentedProjectState & { snapshots: ProjectSnapshot[] };

const LIBRARY_KEY = "infographic-lab-augmented-library-v1";
const BRANDS_KEY = "infographic-lab-augmented-brands-v1";

export function inferBlockType(layout: CanonicalInfographic["layout"]): BlockKind {
  if (layout === "process") return "process";
  if (layout === "timeline") return "timeline";
  if (layout === "comparison") return "comparison";
  return "list";
}

export function normalizeInfographic(data: CanonicalInfographic): CanonicalInfographic {
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      blockType: item.blockType ?? inferBlockType(data.layout),
      claimType: item.claimType ?? "interpretation",
    })),
  };
}

function escapeMermaid(value: string) {
  return value.replace(/["\n\r]/g, " ").replace(/[{}[\]]/g, "").trim();
}

export function buildMermaid(data: CanonicalInfographic) {
  const title = escapeMermaid(data.title);
  const nodes = data.items.map((item, index) => `  N${index + 1}["${escapeMermaid(item.title)}<br/>${escapeMermaid(item.description)}"]`);
  const lines = ["flowchart TD", `  ROOT(["${title}"])`, ...nodes];

  if (data.layout === "process" || data.layout === "timeline") {
    if (data.items.length) lines.push("  ROOT --> N1");
    for (let index = 1; index < data.items.length; index += 1) lines.push(`  N${index} --> N${index + 1}`);
  } else if (data.layout === "comparison") {
    data.items.forEach((_, index) => lines.push(`  ROOT --> N${index + 1}`));
  } else {
    data.items.forEach((_, index) => lines.push(`  ROOT --> N${index + 1}`));
  }

  return lines.join("\n");
}

export function buildMarkdown(data: CanonicalInfographic, intent: UsageIntent, brand: BrandProfile) {
  const intentLabel = intentOptions.find((item) => item.value === intent)?.label ?? intent;
  const lines = [`# ${data.title}`];
  if (data.subtitle) lines.push("", data.subtitle);
  lines.push("", `> Objectif : ${intentLabel}`);
  data.items.forEach((item, index) => {
    lines.push("", `## ${index + 1}. ${item.title}`, "", item.description);
    if (item.claimType) lines.push("", `**Statut :** ${claimOptions.find((claim) => claim.value === item.claimType)?.label ?? item.claimType}`);
    if (item.evidence) lines.push("", `**Source :** ${item.evidence}`);
  });
  if (brand.footer?.trim()) lines.push("", "---", brand.footer.trim());
  return lines.join("\n");
}

export function buildMindmap(data: CanonicalInfographic) {
  return {
    title: data.title,
    subtitle: data.subtitle ?? "",
    children: data.items.map((item) => ({
      title: item.title,
      description: item.description,
      type: item.blockType ?? inferBlockType(data.layout),
      claim: item.claimType ?? "interpretation",
    })),
  };
}

export function buildSourcesMarkdown(data: CanonicalInfographic) {
  const lines = [`# Sources — ${data.title}`, ""];
  let sourceIndex = 1;
  for (const item of data.items) {
    if (!item.evidence) continue;
    lines.push(`## [${sourceIndex}] ${item.title}`, "", item.evidence, "", `Statut : ${item.claimType ?? "interpretation"}`, "");
    sourceIndex += 1;
  }
  if (sourceIndex === 1) lines.push("Aucune preuve source explicite n'est attachée à ce projet.");
  return lines.join("\n");
}

export function localQualityReview(data: CanonicalInfographic): QualityReview {
  const issues: QualityIssue[] = [];
  let score = 100;
  if (data.title.length > 72) {
    issues.push({ severity: "warning", category: "readability", message: "Le titre principal est long pour un visuel.", suggestion: "Ramener le titre sous 72 caractères." });
    score -= 10;
  }
  if (data.items.length > 6) {
    issues.push({ severity: "info", category: "structure", message: "Le visuel contient plus de six blocs.", suggestion: "Fusionner les blocs secondaires si la lecture semble dense." });
    score -= 5;
  }
  data.items.forEach((item, itemIndex) => {
    if (item.title.length > 42) {
      issues.push({ severity: "warning", category: "readability", message: `Le bloc ${itemIndex + 1} a un titre trop long.`, itemIndex, suggestion: "Raccourcir le titre." });
      score -= 4;
    }
    if (item.description.length > 130) {
      issues.push({ severity: "warning", category: "readability", message: `Le bloc ${itemIndex + 1} est chargé en texte.`, itemIndex, suggestion: "Réduire la description." });
      score -= 5;
    }
    if (item.claimType === "fact" && !item.evidence) {
      issues.push({ severity: "warning", category: "sources", message: `Le bloc ${itemIndex + 1} est marqué comme fait mais n'a pas de preuve attachée.`, itemIndex, suggestion: "Ajouter une preuve ou reclasser le bloc." });
      score -= 8;
    }
  });
  const normalizedTitles = data.items.map((item) => item.title.trim().toLowerCase());
  if (new Set(normalizedTitles).size !== normalizedTitles.length) {
    issues.push({ severity: "warning", category: "structure", message: "Plusieurs blocs portent le même titre.", suggestion: "Différencier ou fusionner les blocs redondants." });
    score -= 8;
  }
  return {
    score: Math.max(0, score),
    summary: issues.length ? "Contrôles locaux terminés : quelques améliorations sont possibles." : "Structure locale saine et lisible.",
    issues,
    provider: "local",
  };
}

export function safeSlug(value: string) {
  const slug = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return slug || "infographic-lab";
}

export function loadBrands(): BrandProfile[] {
  try {
    const value = JSON.parse(localStorage.getItem(BRANDS_KEY) ?? "[]");
    if (Array.isArray(value)) return [...defaultBrands, ...value.filter((item) => item && typeof item.id === "string")];
  } catch {
    // Ignore corrupt local preferences.
  }
  return [...defaultBrands];
}

export function saveCustomBrand(brand: BrandProfile) {
  const custom = loadBrands().filter((item) => !defaultBrands.some((base) => base.id === item.id) && item.id !== brand.id);
  localStorage.setItem(BRANDS_KEY, JSON.stringify([...custom, brand]));
}

export function loadLibrary(): LocalProjectRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function projectFingerprint(project: AugmentedProjectState) {
  return JSON.stringify({
    sourceText: project.sourceText,
    intent: project.intent,
    provider: project.provider,
    type: project.type,
    style: project.style,
    variantIndex: project.variantIndex,
    brand: project.brand,
    infographic: project.infographic,
  });
}

export function upsertLocalProject(project: AugmentedProjectState, snapshotLabel = "Autosave") {
  const library = loadLibrary();
  const index = library.findIndex((item) => item.id === project.id);
  const previous = index >= 0 ? library[index] : null;
  const snapshots = previous?.snapshots ? [...previous.snapshots] : [];
  if (previous && projectFingerprint(previous) !== projectFingerprint(project)) {
    snapshots.unshift({
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      label: snapshotLabel,
      state: {
        id: previous.id,
        name: previous.name,
        sourceText: previous.sourceText,
        intent: previous.intent,
        provider: previous.provider,
        type: previous.type,
        style: previous.style,
        variantIndex: previous.variantIndex,
        brand: previous.brand,
        infographic: previous.infographic,
      },
    });
  }
  const next: LocalProjectRecord = { ...project, snapshots: snapshots.slice(0, 8) };
  if (index >= 0) library[index] = next;
  else library.unshift(next);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library.slice(0, 30)));
  return next;
}

export function deleteLocalProject(id: string) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(loadLibrary().filter((item) => item.id !== id)));
}

export function duplicateLocalProject(id: string) {
  const source = loadLibrary().find((item) => item.id === id);
  if (!source) return null;
  const now = new Date().toISOString();
  const copy: LocalProjectRecord = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} — copie`,
    createdAt: now,
    updatedAt: now,
    snapshots: [],
  };
  const library = loadLibrary();
  library.unshift(copy);
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library.slice(0, 30)));
  return copy;
}

export function renameLocalProject(id: string, name: string) {
  const library = loadLibrary();
  const item = library.find((project) => project.id === id);
  if (!item) return;
  item.name = name.trim().slice(0, 120) || item.name;
  item.updatedAt = new Date().toISOString();
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number) {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function u32(value: number) {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]);
}

function concat(parts: Uint8Array[]) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

export function buildZip(files: { name: string; data: string | Uint8Array }[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = typeof file.data === "string" ? encoder.encode(file.data) : file.data;
    const checksum = crc32(data);
    const local = concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(checksum),
      u32(data.length), u32(data.length), u16(name.length), u16(0), name, data,
    ]);
    localParts.push(local);
    const central = concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(checksum),
      u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset), name,
    ]);
    centralParts.push(central);
    offset += local.length;
  }
  const local = concat(localParts);
  const central = concat(centralParts);
  const end = concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.length), u32(local.length), u16(0),
  ]);
  return concat([local, central, end]);
}

export function dataUrlToBytes(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return new Uint8Array();
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (header.includes(";base64")) {
    const binary = atob(payload);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }
  return new TextEncoder().encode(decodeURIComponent(payload));
}
