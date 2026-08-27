import type { CanonicalInfographic, CustomVisualKind, VisualTarget } from "./types";

export type VisualVariant = {
  label: string;
  template: string;
  engine?: "antv" | "custom";
  customKind?: CustomVisualKind;
};

export const CUSTOM_VISUAL_KINDS: CustomVisualKind[] = [
  "iceberg",
  "cycle",
  "sankey",
  "matrix",
  "swot",
  "impact",
  "eisenhower",
  "risk",
  "architecture",
  "hub",
  "tree",
  "venn",
  "table",
  "kpi",
  "chart-bar",
  "chart-column",
  "chart-line",
  "chart-donut",
  "chart-waterfall",
];

export const AUDITED_ANTV_TEMPLATES = [
  "sequence-steps-simple",
  "sequence-snake-steps-simple",
  "sequence-roadmap-vertical-simple",
  "sequence-color-snake-steps-horizontal-icon-line",
  "sequence-stairs-front-compact-card",
  "sequence-funnel-simple",
  "sequence-pyramid-simple",
  "sequence-timeline-simple",
  "sequence-horizontal-zigzag-underline-text",
  "sequence-horizontal-zigzag-horizontal-icon-line",
  "compare-binary-horizontal-simple-vs",
  "compare-binary-horizontal-badge-card-vs",
  "compare-binary-horizontal-compact-card-vs",
  "list-grid-simple",
  "list-grid-horizontal-icon-arrow",
  "list-row-horizontal-icon-line",
  "list-sector-simple",
  "list-grid-badge-card",
  "list-grid-compact-card",
  "list-pyramid-compact-card",
  "list-waterfall-compact-card",
] as const;

const preferredKinds: Partial<Record<VisualTarget, CustomVisualKind>> = {
  iceberg: "iceberg",
  cycle: "cycle",
  sankey: "sankey",
  matrix: "matrix",
  architecture: "architecture",
  hub: "hub",
  table: "table",
  kpi: "kpi",
  tree: "tree",
  venn: "venn",
  swot: "swot",
  impact: "impact",
  eisenhower: "eisenhower",
  risk: "risk",
  bar: "chart-bar",
  column: "chart-column",
  line: "chart-line",
  donut: "chart-donut",
  waterfall: "chart-waterfall",
};

function customVariant(label: string, customKind: CustomVisualKind): VisualVariant {
  return { label, template: `custom-${customKind}`, engine: "custom", customKind };
}

function supportsCompactCards(value: CanonicalInfographic) {
  return value.items.every((item) => item.title.trim().length <= 28 && item.description.trim().length <= 72);
}

function supportsTightGeometry(value: CanonicalInfographic) {
  return value.items.every((item) => item.title.trim().length <= 24 && item.description.trim().length <= 46);
}

function hasNumbers(value: CanonicalInfographic) {
  return value.items.filter((item) => typeof item.value === "number" && Number.isFinite(item.value)).length >= 2;
}

function reorderPreferred(variants: VisualVariant[], target: VisualTarget | undefined) {
  if (!target || target === "auto") return variants;
  const kind = preferredKinds[target];
  if (!kind) return variants;
  const index = variants.findIndex((variant) => variant.customKind === kind);
  if (index <= 0) return variants;
  return [variants[index], ...variants.slice(0, index), ...variants.slice(index + 1)];
}

export function buildVariantCatalog(value: CanonicalInfographic): VisualVariant[] {
  const compactCards = supportsCompactCards(value);
  const tightGeometry = supportsTightGeometry(value);
  const orientation = value.appearance?.orientation ?? "auto";
  const variants: VisualVariant[] = [];

  if (value.layout === "process") {
    if (orientation === "portrait") {
      variants.push(
        { label: "Roadmap", template: "sequence-roadmap-vertical-simple" },
        { label: "Étapes", template: "sequence-steps-simple" },
        { label: "Serpent", template: "sequence-snake-steps-simple" },
        { label: "Icônes", template: "sequence-color-snake-steps-horizontal-icon-line" },
      );
    } else {
      variants.push(
        { label: "Étapes", template: "sequence-steps-simple" },
        { label: "Serpent", template: "sequence-snake-steps-simple" },
        { label: "Roadmap", template: "sequence-roadmap-vertical-simple" },
        { label: "Icônes", template: "sequence-color-snake-steps-horizontal-icon-line" },
      );
    }
    if (compactCards && value.items.length <= 4) {
      variants.push({ label: "Cartes", template: "sequence-stairs-front-compact-card" });
    }
    if (tightGeometry) {
      variants.push(
        { label: "Entonnoir", template: "sequence-funnel-simple" },
        { label: "Pyramide", template: "sequence-pyramid-simple" },
      );
    }
  } else if (value.layout === "timeline") {
    if (orientation === "portrait") {
      variants.push(
        { label: "Roadmap", template: "sequence-roadmap-vertical-simple" },
        { label: "Ligne", template: "sequence-timeline-simple" },
      );
    } else {
      variants.push(
        { label: "Ligne", template: "sequence-timeline-simple" },
        { label: "Roadmap", template: "sequence-roadmap-vertical-simple" },
      );
    }
    variants.push(
      { label: "Texte", template: "sequence-horizontal-zigzag-underline-text" },
      { label: "Icônes", template: "sequence-horizontal-zigzag-horizontal-icon-line" },
    );
  } else if (value.layout === "comparison") {
    variants.push({ label: "VS simple", template: "compare-binary-horizontal-simple-vs" });
    if (compactCards) {
      variants.push(
        { label: "VS cartes", template: "compare-binary-horizontal-badge-card-vs" },
        { label: "VS compact", template: "compare-binary-horizontal-compact-card-vs" },
      );
    }
  } else {
    variants.push(
      { label: "Épure", template: "list-grid-simple" },
      { label: "Icônes", template: "list-grid-horizontal-icon-arrow" },
    );
    if (value.items.length <= 4) variants.push({ label: "Ligne", template: "list-row-horizontal-icon-line" });
    if (!value.subtitle?.trim() && tightGeometry) variants.push({ label: "Radial", template: "list-sector-simple" });
    if (compactCards) {
      variants.push(
        { label: "Cartes", template: "list-grid-badge-card" },
        { label: "Compact", template: "list-grid-compact-card" },
      );
      // AntV 0.2.x peut perdre un élément sur ce gabarit à partir de quatre cartes.
      // On préfère ne pas exposer une variante qui tronque silencieusement le contenu.
      if (value.items.length <= 3) variants.push({ label: "Pyramide", template: "list-pyramid-compact-card" });
      variants.push({ label: "Waterfall visuel", template: "list-waterfall-compact-card" });
    }
  }

  variants.push(customVariant("Table visuelle", "table"));
  if (value.items.length >= 2 && value.items.length <= 3) variants.push(customVariant("Venn", "venn"));
  if (value.items.length >= 2) variants.push(customVariant("Hiérarchie", "tree"));
  if (value.items.length >= 3) variants.push(customVariant("Cycle", "cycle"), customVariant("Sankey narratif", "sankey"));
  if (value.items.length >= 3 && value.items.length <= 8) variants.push(customVariant("Iceberg", "iceberg"));
  if (value.items.length >= 3 && value.items.length <= 6) {
    variants.push(customVariant("Architecture", "architecture"), customVariant("Hub / radial", "hub"));
  }
  if (value.items.length === 4) {
    variants.push(
      customVariant("Matrice 2×2", "matrix"),
      customVariant("SWOT", "swot"),
      customVariant("Impact / Effort", "impact"),
      customVariant("Eisenhower", "eisenhower"),
      customVariant("Matrice de risque", "risk"),
    );
  }
  if (hasNumbers(value)) {
    variants.push(
      customVariant("KPI", "kpi"),
      customVariant("Barres", "chart-bar"),
      customVariant("Colonnes", "chart-column"),
      customVariant("Courbe", "chart-line"),
      customVariant("Donut", "chart-donut"),
      customVariant("Waterfall chiffré", "chart-waterfall"),
    );
  }

  return reorderPreferred(variants, value.appearance?.visual);
}
