/* #20 — libellés métier dans l'interface, sans modifier les données internes. */

const blockLabels: Record<string, string> = {
  process: "Processus",
  timeline: "Chronologie",
  comparison: "Comparaison",
  list: "Liste",
  cycle: "Cycle",
  matrix: "Matrice",
  architecture: "Architecture",
  summary: "Synthèse",
};

const claimLabels: Record<string, string> = {
  fact: "Fait sourcé",
  interpretation: "Interprétation",
  suggestion: "Suggestion IA",
};

const templateLabels: Record<string, string> = {
  editorial: "Editorial Luxe",
  impact: "Campaign Impact",
  spotlight: "Product Spotlight",
  retail: "Retail Promo",
  zen: "Zen Minimal",
};

const categoryLabels: Record<string, string> = {
  social: "Réseaux sociaux",
  print: "Impression",
  retail: "Point de vente",
};

const qualityLabels: Record<string, string> = {
  readability: "Lisibilité",
  structure: "Structure",
  sources: "Sources",
  content: "Contenu",
  accuracy: "Exactitude",
  evidence: "Preuves",
  traceability: "Traçabilité",
  visual: "Visuel",
};

function setText(node: Element, next: string) {
  if (node.textContent?.trim() !== next) node.textContent = next;
}

function translateBlockRows(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".studio-block-row-copy small").forEach((node) => {
    const raw = node.textContent?.trim() ?? "";
    const parts = raw.split("·").map((part) => part.trim());
    if (parts.length !== 2) return;
    const block = blockLabels[parts[0]];
    const claim = claimLabels[parts[1]];
    if (block && claim) setText(node, `${block} · ${claim}`);
  });
}

function translateMindmap(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".studio-mind-branches article > span").forEach((node) => {
    const raw = node.textContent?.trim() ?? "";
    const parts = raw.split("·").map((part) => part.trim());
    if (parts.length < 2) return;
    const technical = parts.at(-1) ?? "";
    const label = blockLabels[technical];
    if (!label) return;
    setText(node, `${parts.slice(0, -1).join(" · ")} · ${label}`);
  });
}

function translateQuality(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".studio-issues article > span").forEach((node) => {
    const raw = node.textContent?.trim().toLowerCase() ?? "";
    const label = qualityLabels[raw];
    if (label) setText(node, label);
  });
}

function translateMarketingTemplate(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".marketing-stage-caption > span").forEach((node) => {
    const raw = node.textContent?.trim().toLowerCase() ?? "";
    const label = templateLabels[raw];
    if (label) setText(node, label);
  });
}

function translateMarketingCategories(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".marketing-pack-list label small").forEach((node) => {
    const raw = node.textContent?.trim() ?? "";
    const separator = raw.lastIndexOf("·");
    if (separator < 0) return;
    const hint = raw.slice(0, separator).trim();
    const technical = raw.slice(separator + 1).trim().toLowerCase();
    const label = categoryLabels[technical];
    if (label) setText(node, `${hint} · ${label}`);
  });
}

function translateProviderHints(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".studio-provider-picker small").forEach((node) => {
    if (node.textContent?.trim().toLowerCase() === "fallback") setText(node, "automatique");
  });
}

function applyHumanLabels(root: ParentNode = document) {
  translateBlockRows(root);
  translateMindmap(root);
  translateQuality(root);
  translateMarketingTemplate(root);
  translateMarketingCategories(root);
  translateProviderHints(root);
}

let scheduled = false;
function scheduleTranslation() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    applyHumanLabels(document);
  });
}

function startLabelObserver() {
  applyHumanLabels(document);
  const observer = new MutationObserver(scheduleTranslation);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", startLabelObserver, { once: true });
} else {
  startLabelObserver();
}
