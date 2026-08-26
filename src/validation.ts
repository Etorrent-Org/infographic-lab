import type {
  BlockKind,
  CanonicalInfographic,
  ClaimKind,
  InfographicAppearance,
  InfographicIcon,
  InfographicItem,
  InfographicKind,
  InfographicProject,
  InfographicStyle,
  VisualDensity,
  VisualOrientation,
  VisualTarget,
} from "./types";

const layouts = new Set(["process", "comparison", "timeline", "list"]);
const projectTypes = new Set<InfographicKind>(["auto", "process", "comparison", "timeline", "list"]);
const projectStyles = new Set<InfographicStyle>([
  "clean", "soft", "dark", "sketch", "chalk", "zen", "pro", "minimal", "tech",
]);
const styleAliases: Partial<Record<InfographicStyle, InfographicStyle>> = {
  zen: "soft",
  pro: "clean",
  minimal: "clean",
  tech: "dark",
};
const projectIcons = new Set<InfographicIcon>([
  "idea", "search", "target", "process", "team", "data", "security", "automation",
  "growth", "money", "customer", "check", "warning", "calendar", "tools", "spark",
]);
const blockKinds = new Set<BlockKind>([
  "process", "timeline", "comparison", "list", "cycle", "matrix", "architecture", "summary",
]);
const claimKinds = new Set<ClaimKind>(["fact", "interpretation", "suggestion"]);
const densities = new Set<VisualDensity>(["compact", "balanced", "airy"]);
const orientations = new Set<VisualOrientation>(["auto", "portrait", "landscape", "square"]);
const visualTargets = new Set<VisualTarget>([
  "auto", "iceberg", "cycle", "sankey", "matrix", "architecture", "hub", "table", "kpi",
  "tree", "venn", "swot", "impact", "eisenhower", "risk", "bar", "column", "line", "donut", "waterfall",
]);
const hexColor = /^#[0-9a-fA-F]{6}$/;

function isText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function validateAppearance(value: unknown): InfographicAppearance {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Réponse IA invalide : apparence incorrecte.");
  }
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["accent", "background", "density", "orientation", "visual"].includes(key))) {
    throw new Error("Réponse IA invalide : propriété d'apparence inattendue.");
  }
  if (data.accent !== undefined && (typeof data.accent !== "string" || !hexColor.test(data.accent))) {
    throw new Error("Réponse IA invalide : couleur d'accent incorrecte.");
  }
  if (data.background !== undefined && (typeof data.background !== "string" || !hexColor.test(data.background))) {
    throw new Error("Réponse IA invalide : couleur de fond incorrecte.");
  }
  if (data.density !== undefined && (typeof data.density !== "string" || !densities.has(data.density as VisualDensity))) {
    throw new Error("Réponse IA invalide : densité incorrecte.");
  }
  if (data.orientation !== undefined && (typeof data.orientation !== "string" || !orientations.has(data.orientation as VisualOrientation))) {
    throw new Error("Réponse IA invalide : orientation incorrecte.");
  }
  if (data.visual !== undefined && (typeof data.visual !== "string" || !visualTargets.has(data.visual as VisualTarget))) {
    throw new Error("Réponse IA invalide : visuel cible incorrect.");
  }
  return data as InfographicAppearance;
}

export function validateInfographicItem(value: unknown): InfographicItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Réponse IA invalide : élément attendu.");
  }
  const record = value as Record<string, unknown>;
  const allowed = ["title", "description", "icon", "blockType", "claimType", "evidence", "value", "unit", "category", "series"];
  if (Object.keys(record).some((key) => !allowed.includes(key))) {
    throw new Error("Réponse IA invalide : propriété d'élément inattendue.");
  }
  if (!isText(record.title, 1, 60) || !isText(record.description, 1, 180)) {
    throw new Error("Réponse IA invalide : contenu d'élément incorrect.");
  }
  if (record.icon !== undefined && (typeof record.icon !== "string" || !projectIcons.has(record.icon as InfographicIcon))) {
    throw new Error("Réponse IA invalide : pictogramme incorrect.");
  }
  if (record.blockType !== undefined && (typeof record.blockType !== "string" || !blockKinds.has(record.blockType as BlockKind))) {
    throw new Error("Réponse IA invalide : type de bloc incorrect.");
  }
  if (record.claimType !== undefined && (typeof record.claimType !== "string" || !claimKinds.has(record.claimType as ClaimKind))) {
    throw new Error("Réponse IA invalide : statut de contenu incorrect.");
  }
  if (record.evidence !== undefined && !isText(record.evidence, 1, 260)) {
    throw new Error("Réponse IA invalide : preuve source incorrecte.");
  }
  if (record.value !== undefined && (typeof record.value !== "number" || !Number.isFinite(record.value))) {
    throw new Error("Réponse IA invalide : valeur numérique incorrecte.");
  }
  if (record.unit !== undefined && !isText(record.unit, 1, 24)) {
    throw new Error("Réponse IA invalide : unité incorrecte.");
  }
  if (record.category !== undefined && !isText(record.category, 1, 40)) {
    throw new Error("Réponse IA invalide : catégorie incorrecte.");
  }
  if (record.series !== undefined && !isText(record.series, 1, 40)) {
    throw new Error("Réponse IA invalide : série incorrecte.");
  }
  return record as InfographicItem;
}

export function validateCanonicalInfographic(value: unknown): CanonicalInfographic {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Réponse IA invalide : objet attendu.");
  }
  const data = value as Record<string, unknown>;
  const keys = Object.keys(data);
  if (keys.some((key) => !["title", "subtitle", "layout", "items", "appearance"].includes(key))) {
    throw new Error("Réponse IA invalide : propriété inattendue.");
  }
  if (!isText(data.title, 1, 120)) throw new Error("Réponse IA invalide : titre.");
  if (data.subtitle !== undefined && !isText(data.subtitle, 0, 180)) {
    throw new Error("Réponse IA invalide : sous-titre.");
  }
  if (typeof data.layout !== "string" || !layouts.has(data.layout)) {
    throw new Error("Réponse IA invalide : layout.");
  }
  if (!Array.isArray(data.items) || data.items.length < 2 || data.items.length > 8) {
    throw new Error("Réponse IA invalide : 2 à 8 éléments sont requis.");
  }
  if (data.layout === "comparison" && data.items.length !== 2) {
    throw new Error("Réponse IA invalide : une comparaison doit contenir deux options.");
  }
  data.items.forEach((item) => validateInfographicItem(item));
  if (data.appearance !== undefined) validateAppearance(data.appearance);
  return data as CanonicalInfographic;
}

export function validateInfographicProject(value: unknown): InfographicProject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Projet JSON invalide : objet attendu.");
  }
  const data = value as Record<string, unknown>;
  const allowedKeys = [
    "format", "version", "savedAt", "sourceText", "type", "style", "variantIndex", "infographic",
  ];
  if (Object.keys(data).some((key) => !allowedKeys.includes(key))) {
    throw new Error("Projet JSON invalide : propriété inattendue.");
  }
  if (data.format !== "infographic-lab") throw new Error("Projet JSON invalide : format non reconnu.");
  if (data.version !== 1 && data.version !== 2) throw new Error("Projet JSON invalide : version non prise en charge.");
  if (typeof data.savedAt !== "string" || data.savedAt.length > 64 || Number.isNaN(Date.parse(data.savedAt))) {
    throw new Error("Projet JSON invalide : date de sauvegarde incorrecte.");
  }
  if (typeof data.sourceText !== "string" || data.sourceText.length > 12000) {
    throw new Error("Projet JSON invalide : texte source incorrect.");
  }
  if (typeof data.type !== "string" || !projectTypes.has(data.type as InfographicKind)) {
    throw new Error("Projet JSON invalide : type incorrect.");
  }
  if (typeof data.style !== "string" || !projectStyles.has(data.style as InfographicStyle)) {
    throw new Error("Projet JSON invalide : style incorrect.");
  }
  if (typeof data.variantIndex !== "number" || !Number.isInteger(data.variantIndex) || data.variantIndex < 0 || data.variantIndex > 99) {
    throw new Error("Projet JSON invalide : variante incorrecte.");
  }

  let infographic: CanonicalInfographic;
  try {
    infographic = validateCanonicalInfographic(data.infographic);
  } catch (error) {
    const message = error instanceof Error ? error.message : "infographie incorrecte.";
    throw new Error(`Projet JSON invalide : ${message.replace("Réponse IA invalide : ", "").replace("Réponse Vibe invalide : ", "")}`);
  }

  const originalStyle = data.style as InfographicStyle;
  const normalizedStyle = styleAliases[originalStyle] ?? originalStyle;

  return {
    format: "infographic-lab",
    version: data.version as 1 | 2,
    savedAt: data.savedAt,
    sourceText: data.sourceText,
    type: data.type as InfographicKind,
    style: normalizedStyle,
    variantIndex: data.variantIndex,
    infographic,
  };
}
