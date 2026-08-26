import type { CanonicalInfographic, CustomVisualKind, InfographicItem } from "./types";

export type CanvasSpec = {
  width: number;
  height: number;
  padding: number;
  headerBottom: number;
  contentTop: number;
  contentBottom: number;
};

export type LayoutBoxRole = "item" | "label" | "root" | "objective" | "shape" | "plot";

export type LayoutBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  role: LayoutBoxRole;
  itemIndex?: number;
  allowOverlap?: boolean;
};

export type VisualLayoutPlan = {
  kind: CustomVisualKind;
  spec: CanvasSpec;
  content: LayoutBox;
  boxes: LayoutBox[];
  meta: Record<string, number | string | boolean>;
};

export type WrappedText = {
  lines: string[];
  truncated: boolean;
};

export type IcebergClassification = {
  visible: { item: InfographicItem; index: number }[];
  deep: { item: InfographicItem; index: number }[];
  objective: { item: InfographicItem; index: number } | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function cleanVisualText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .replace(/\s*([:;!?])\s*/g, " $1 ")
    .replace(/([:;,])\s*\.{2,}/g, "$1")
    .replace(/\.{3,}/g, "…")
    .replace(/[:;,\-]?\s*…\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function wrapVisualText(value: string, maxChars: number, maxLines: number): WrappedText {
  const text = cleanVisualText(value);
  if (!text) return { lines: [], truncated: false };
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let consumedWords = 0;

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
      consumedWords += 1;
      continue;
    }
    lines.push(current);
    current = word;
    consumedWords += 1;
    if (lines.length >= maxLines - 1) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  const truncated = consumedWords < words.length;
  if (truncated && lines.length) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].replace(/[.…]+$/, "").trimEnd()}…`;
  }
  return { lines, truncated };
}

export function charsForWidth(width: number, fontSize: number, factor = 0.56) {
  return Math.max(8, Math.floor(width / Math.max(1, fontSize * factor)));
}

export function canvasSpec(value: CanonicalInfographic): CanvasSpec {
  const orientation = value.appearance?.orientation ?? "auto";
  const portrait = orientation === "portrait";
  const square = orientation === "square";
  const width = portrait ? 860 : square ? 980 : 1200;
  const height = portrait ? 1180 : square ? 980 : 760;
  const padding = portrait ? 42 : 48;
  const titleSize = portrait ? 30 : 34;
  const titleChars = portrait ? 34 : square ? 44 : 54;
  const titleLines = wrapVisualText(value.title, titleChars, 2).lines.length || 1;
  const subtitleLines = value.subtitle ? wrapVisualText(value.subtitle, portrait ? 58 : 88, 2).lines.length : 0;
  const headerBottom = clamp(
    42 + titleLines * (titleSize + 5) + (subtitleLines ? 20 + subtitleLines * 19 : 10),
    portrait ? 144 : 132,
    portrait ? 190 : 176,
  );
  const contentTop = headerBottom + 18;
  const contentBottom = height - padding;
  return { width, height, padding, headerBottom, contentTop, contentBottom };
}

function contentBox(spec: CanvasSpec): LayoutBox {
  return {
    id: "content",
    x: spec.padding,
    y: spec.contentTop,
    width: spec.width - spec.padding * 2,
    height: spec.contentBottom - spec.contentTop,
    role: "plot",
    allowOverlap: true,
  };
}

function makeBox(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  role: LayoutBoxRole,
  itemIndex?: number,
  allowOverlap = false,
): LayoutBox {
  return { id, x, y, width, height, role, itemIndex, allowOverlap };
}

function stackBoxes(
  count: number,
  region: LayoutBox,
  prefix: string,
  role: LayoutBoxRole = "item",
  gap = 12,
): LayoutBox[] {
  if (count <= 0) return [];
  const height = (region.height - gap * Math.max(0, count - 1)) / count;
  return Array.from({ length: count }, (_, index) => makeBox(
    `${prefix}-${index}`,
    region.x,
    region.y + index * (height + gap),
    region.width,
    height,
    role,
    index,
  ));
}

function gridBoxes(
  count: number,
  region: LayoutBox,
  columns: number,
  prefix: string,
  role: LayoutBoxRole = "item",
  gap = 14,
): LayoutBox[] {
  if (count <= 0) return [];
  const safeColumns = Math.max(1, Math.min(columns, count));
  const rows = Math.ceil(count / safeColumns);
  const width = (region.width - gap * Math.max(0, safeColumns - 1)) / safeColumns;
  const height = (region.height - gap * Math.max(0, rows - 1)) / rows;
  return Array.from({ length: count }, (_, index) => {
    const col = index % safeColumns;
    const row = Math.floor(index / safeColumns);
    return makeBox(
      `${prefix}-${index}`,
      region.x + col * (width + gap),
      region.y + row * (height + gap),
      width,
      height,
      role,
      index,
    );
  });
}

function normalizedCategory(item: InfographicItem) {
  return String(item.category ?? "").trim().toLocaleLowerCase("fr");
}

function objectiveLike(item: InfographicItem) {
  const category = normalizedCategory(item);
  if (["objective", "objectif", "goal", "cap"].includes(category)) return true;
  const text = `${item.title} ${item.description}`.toLocaleLowerCase("fr");
  return /\b(objectif|finalit[eé]|but|cible|r[eé]sultat attendu|solution souhait[eé]e|cap)\b/.test(text);
}

function visibleLike(item: InfographicItem) {
  const category = normalizedCategory(item);
  if (["visible", "surface", "signal", "symptom", "symptome", "symptôme"].includes(category)) return true;
  const text = `${item.title} ${item.description}`.toLocaleLowerCase("fr");
  return /\b(visible|surface|signe|sympt[oô]me|constat|impact observable|signal|retard|relance)\b/.test(text);
}

export function classifyIcebergItems(value: CanonicalInfographic): IcebergClassification {
  const indexed = value.items.map((item, index) => ({ item, index }));
  const objective = indexed.find(({ item }) => objectiveLike(item)) ?? null;
  const candidates = indexed.filter(({ index }) => index !== objective?.index);
  const explicitVisible = candidates.filter(({ item }) => visibleLike(item));
  const visibleTarget = explicitVisible.length
    ? explicitVisible.slice(0, 2)
    : candidates.slice(0, candidates.length >= 6 ? 2 : 1);
  const visibleIndexes = new Set(visibleTarget.map(({ index }) => index));
  const deep = candidates.filter(({ index }) => !visibleIndexes.has(index)).slice(0, 6);
  return { visible: visibleTarget, deep, objective };
}

function icebergPlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const classification = classifyIcebergItems(value);
  const portrait = spec.width < 900;
  const gap = portrait ? 22 : 28;
  const shapeWidth = content.width * (portrait ? 0.43 : 0.44);
  const leftWidth = content.width - shapeWidth - gap;
  const shapeX = content.x + leftWidth + gap;
  const waterY = content.y + (portrait ? 210 : 170);
  const objectiveHeight = classification.objective ? (portrait ? 86 : 72) : 0;
  const visibleGap = 10;
  const visibleHeight = classification.visible.length <= 1 ? 86 : 74;
  const visibleBoxes = classification.visible.map(({ index }, local) => makeBox(
    `visible-${local}`,
    content.x,
    content.y + 8 + local * (visibleHeight + visibleGap),
    leftWidth,
    visibleHeight,
    "item",
    index,
  ));
  const deepTop = waterY + 34;
  const deepBottom = content.y + content.height - objectiveHeight - (objectiveHeight ? 16 : 0);
  const deepRegion = makeBox("deep-region", content.x, deepTop, leftWidth, Math.max(90, deepBottom - deepTop), "plot", undefined, true);
  const deepBoxes = stackBoxes(classification.deep.length, deepRegion, "deep", "item", portrait ? 10 : 11)
    .map((box, local) => ({ ...box, itemIndex: classification.deep[local]?.index }));
  const objectiveBox = classification.objective
    ? makeBox(
        "objective",
        content.x,
        content.y + content.height - objectiveHeight,
        leftWidth,
        objectiveHeight,
        "objective",
        classification.objective.index,
      )
    : null;
  const shapeBox = makeBox(
    "iceberg-shape",
    shapeX,
    content.y + 14,
    shapeWidth,
    content.height - 28,
    "shape",
    undefined,
    true,
  );
  return {
    kind: "iceberg",
    spec,
    content,
    boxes: [...visibleBoxes, ...deepBoxes, ...(objectiveBox ? [objectiveBox] : []), shapeBox],
    meta: { waterY, shapeX, shapeWidth, leftWidth, visibleCount: classification.visible.length, deepCount: classification.deep.length },
  };
}

function sideRailPlan(kind: "cycle" | "hub", value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const items = value.items.slice(0, kind === "cycle" ? 7 : 6);
  const portrait = spec.width < 900;
  const centerWidth = portrait ? 230 : 300;
  const railGap = portrait ? 18 : 24;
  const railWidth = (content.width - centerWidth - railGap * 2) / 2;
  const leftRegion = makeBox("left-rail", content.x, content.y + 8, railWidth, content.height - 16, "plot", undefined, true);
  const center = makeBox("center-shape", content.x + railWidth + railGap, content.y + content.height * 0.2, centerWidth, content.height * 0.6, "shape", undefined, true);
  const rightRegion = makeBox("right-rail", center.x + center.width + railGap, content.y + 8, railWidth, content.height - 16, "plot", undefined, true);
  const leftItems = items.filter((_, index) => index % 2 === 0);
  const rightItems = items.filter((_, index) => index % 2 === 1);
  const leftBoxes = stackBoxes(leftItems.length, leftRegion, `${kind}-left`, "item", 12)
    .map((box, local) => ({ ...box, itemIndex: local * 2 }));
  const rightBoxes = stackBoxes(rightItems.length, rightRegion, `${kind}-right`, "item", 12)
    .map((box, local) => ({ ...box, itemIndex: local * 2 + 1 }));
  return { kind, spec, content, boxes: [...leftBoxes, ...rightBoxes, center], meta: { centerWidth, railWidth } };
}

function sankeyPlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(7, value.items.length);
  const gap = spec.width < 900 ? 10 : 14;
  const slotWidth = (content.width - gap * Math.max(0, count - 1)) / Math.max(1, count);
  const cardHeight = Math.min(spec.width < 900 ? 108 : 96, content.height * 0.28);
  const topY = content.y + 8;
  const bottomY = content.y + content.height - cardHeight - 8;
  const boxes = Array.from({ length: count }, (_, index) => makeBox(
    `sankey-${index}`,
    content.x + index * (slotWidth + gap),
    index % 2 === 0 ? topY : bottomY,
    slotWidth,
    cardHeight,
    "item",
    index,
  ));
  const plot = makeBox(
    "sankey-ribbon",
    content.x + slotWidth * 0.35,
    content.y + content.height * 0.38,
    content.width - slotWidth * 0.7,
    content.height * 0.24,
    "plot",
    undefined,
    true,
  );
  return { kind: "sankey", spec, content, boxes: [...boxes, plot], meta: { cardHeight, slotWidth } };
}

function matrixPlan(kind: CustomVisualKind, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const portrait = spec.width < 900;
  const insetX = portrait ? 38 : 34;
  const insetY = portrait ? 38 : 26;
  const matrixRegion = makeBox(
    "matrix-region",
    content.x + insetX,
    content.y + insetY,
    content.width - insetX * 2,
    content.height - insetY * 2,
    "plot",
    undefined,
    true,
  );
  return { kind, spec, content, boxes: gridBoxes(4, matrixRegion, 2, kind, "item", portrait ? 24 : 24), meta: {} };
}

function architecturePlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(6, value.items.length);
  const outerX = spec.width < 900 ? 30 : 40;
  const outerY = 20;
  const gap = 16;
  const region = makeBox(
    "architecture-region",
    content.x + outerX,
    content.y + outerY,
    content.width - outerX * 2,
    content.height - outerY * 2,
    "plot",
    undefined,
    true,
  );
  const baseHeight = (region.height - gap * Math.max(0, count - 1)) / Math.max(1, count);
  const boxes = Array.from({ length: count }, (_, index) => {
    const inset = Math.min(region.width * 0.12, index * (spec.width < 900 ? 12 : 18));
    return makeBox(
      `architecture-${index}`,
      region.x + inset,
      region.y + index * (baseHeight + gap),
      region.width - inset * 2,
      baseHeight,
      "item",
      index,
    );
  });
  return { kind: "architecture", spec, content, boxes, meta: { count } };
}

function tablePlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(8, value.items.length);
  const marginX = spec.width < 1000 ? 34 : 28;
  const marginY = spec.width < 1000 ? 30 : 22;
  const headerHeight = 48;
  const headerGap = 12;
  const rowGap = spec.width < 1000 ? 10 : 8;
  const tableX = content.x + marginX;
  const tableWidth = content.width - marginX * 2;
  const header = makeBox("table-header", tableX, content.y + marginY, tableWidth, headerHeight, "label");
  const rowsRegion = makeBox(
    "table-rows",
    tableX,
    header.y + header.height + headerGap,
    tableWidth,
    content.y + content.height - marginY - (header.y + header.height + headerGap),
    "plot",
    undefined,
    true,
  );
  const rows = stackBoxes(count, rowsRegion, "table-row", "item", rowGap);
  return { kind: "table", spec, content, boxes: [header, ...rows], meta: { headerHeight } };
}

function kpiPlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(6, value.items.length);
  const portrait = spec.width < 900;
  const columns = portrait ? 2 : 3;
  const insetX = portrait ? 36 : 32;
  const insetY = portrait ? 32 : 24;
  const region = makeBox(
    "kpi-region",
    content.x + insetX,
    content.y + insetY,
    content.width - insetX * 2,
    content.height - insetY * 2,
    "plot",
    undefined,
    true,
  );
  return { kind: "kpi", spec, content, boxes: gridBoxes(count, region, columns, "kpi", "item", portrait ? 22 : 20), meta: { columns } };
}

function vennPlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(3, Math.max(2, value.items.length));
  const portrait = spec.width < 900;
  const shapeWidth = content.width * (portrait ? 0.58 : 0.55);
  const shapeHeight = content.height * (portrait ? 0.52 : 0.62);
  const shape = makeBox(
    "venn-shape",
    content.x + (content.width - shapeWidth) / 2,
    content.y + (content.height - shapeHeight) / 2,
    shapeWidth,
    shapeHeight,
    "shape",
    undefined,
    true,
  );
  const labelWidth = portrait ? content.width * 0.38 : content.width * 0.31;
  const labelHeight = portrait ? 112 : 96;
  const boxes = count === 2
    ? [
        makeBox("venn-0", content.x, content.y + 24, labelWidth, labelHeight, "item", 0),
        makeBox("venn-1", content.x + content.width - labelWidth, content.y + 24, labelWidth, labelHeight, "item", 1),
      ]
    : [
        makeBox("venn-0", content.x, content.y + 12, labelWidth, labelHeight, "item", 0),
        makeBox("venn-1", content.x + content.width - labelWidth, content.y + 12, labelWidth, labelHeight, "item", 1),
        makeBox("venn-2", content.x + (content.width - labelWidth) / 2, content.y + content.height - labelHeight - 8, labelWidth, labelHeight, "item", 2),
      ];
  return { kind: "venn", spec, content, boxes: [...boxes, shape], meta: { count } };
}

function treePlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(8, value.items.length);
  const rootWidth = spec.width < 900 ? 280 : 320;
  const rootHeight = 76;
  const root = makeBox("tree-root", content.x + (content.width - rootWidth) / 2, content.y + 4, rootWidth, rootHeight, "root");
  const childTop = root.y + root.height + 54;
  const childRegion = makeBox("tree-children", content.x, childTop, content.width, content.y + content.height - childTop, "plot", undefined, true);
  const columns = spec.width < 900 ? 2 : Math.min(4, Math.max(2, count));
  return { kind: "tree", spec, content, boxes: [root, ...gridBoxes(count, childRegion, columns, "tree-child", "item", 14)], meta: { columns } };
}

function barPlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(8, value.items.length);
  const labelWidth = spec.width < 900 ? 190 : 220;
  const gap = 18;
  const labelRegion = makeBox("bar-labels", content.x, content.y + 8, labelWidth, content.height - 16, "plot", undefined, true);
  const labels = stackBoxes(count, labelRegion, "bar-label", "label", 8);
  const plot = makeBox("bar-plot", content.x + labelWidth + gap, content.y + 8, content.width - labelWidth - gap, content.height - 16, "plot", undefined, true);
  return { kind: "chart-bar", spec, content, boxes: [...labels, plot], meta: { labelWidth } };
}

function cartesianPlan(kind: "chart-column" | "chart-line" | "chart-waterfall", value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(8, value.items.length);
  const labelHeight = 54;
  const plot = makeBox("cartesian-plot", content.x + 44, content.y + 8, content.width - 64, content.height - labelHeight - 18, "plot", undefined, true);
  const slot = plot.width / Math.max(1, count);
  const labelGap = 8;
  const labels = Array.from({ length: count }, (_, index) => makeBox(
    `${kind}-label-${index}`,
    plot.x + index * slot + labelGap / 2,
    plot.y + plot.height + 8,
    Math.max(28, slot - labelGap),
    labelHeight,
    "label",
    index,
  ));
  return { kind, spec, content, boxes: [plot, ...labels], meta: { slot } };
}

function donutPlan(value: CanonicalInfographic, spec: CanvasSpec, content: LayoutBox): VisualLayoutPlan {
  const count = Math.min(6, value.items.length);
  const portrait = spec.width < 900;
  const shapeWidth = content.width * (portrait ? 0.5 : 0.54);
  const shape = makeBox("donut-shape", content.x, content.y + 10, shapeWidth, content.height - 20, "shape", undefined, true);
  const legendRegion = makeBox(
    "donut-legend-region",
    content.x + shapeWidth + 26,
    content.y + 18,
    content.width - shapeWidth - 26,
    content.height - 36,
    "plot",
    undefined,
    true,
  );
  const legend = stackBoxes(count, legendRegion, "donut-legend", "item", 8);
  return { kind: "chart-donut", spec, content, boxes: [shape, ...legend], meta: { shapeWidth } };
}

export function buildVisualPlan(kind: CustomVisualKind, value: CanonicalInfographic): VisualLayoutPlan {
  const spec = canvasSpec(value);
  const content = contentBox(spec);
  if (kind === "iceberg") return icebergPlan(value, spec, content);
  if (kind === "cycle" || kind === "hub") return sideRailPlan(kind, value, spec, content);
  if (kind === "sankey") return sankeyPlan(value, spec, content);
  if (["matrix", "swot", "impact", "eisenhower", "risk"].includes(kind)) return matrixPlan(kind, spec, content);
  if (kind === "architecture") return architecturePlan(value, spec, content);
  if (kind === "table") return tablePlan(value, spec, content);
  if (kind === "kpi") return kpiPlan(value, spec, content);
  if (kind === "venn") return vennPlan(value, spec, content);
  if (kind === "tree") return treePlan(value, spec, content);
  if (kind === "chart-bar") return barPlan(value, spec, content);
  if (kind === "chart-column" || kind === "chart-line" || kind === "chart-waterfall") return cartesianPlan(kind, value, spec, content);
  return donutPlan(value, spec, content);
}

export function boxesOverlap(a: LayoutBox, b: LayoutBox, gap = 0) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

export function auditVisualPlan(plan: VisualLayoutPlan) {
  const issues: string[] = [];
  const margin = 4;
  const collidable = plan.boxes.filter((box) => !box.allowOverlap && box.role !== "plot" && box.role !== "shape");

  for (const box of collidable) {
    if (box.width < 72 || box.height < 42) issues.push(`${box.id}: zone trop petite`);
    if (box.x < margin || box.y < margin || box.x + box.width > plan.spec.width - margin || box.y + box.height > plan.spec.height - margin) {
      issues.push(`${box.id}: hors canvas`);
    }
    if (box.y < plan.spec.contentTop - 4) issues.push(`${box.id}: collision potentielle avec l'en-tête`);
  }

  for (let i = 0; i < collidable.length; i += 1) {
    for (let j = i + 1; j < collidable.length; j += 1) {
      if (boxesOverlap(collidable[i], collidable[j], 6)) {
        issues.push(`${collidable[i].id}/${collidable[j].id}: chevauchement`);
      }
    }
  }

  const contentArea = plan.content.width * plan.content.height;
  const usedArea = collidable.reduce((sum, box) => sum + box.width * box.height, 0);
  const density = contentArea > 0 ? usedArea / contentArea : 1;
  if (density > 0.82) issues.push("densité excessive");
  return issues;
}

export function structuralScore(plan: VisualLayoutPlan) {
  const issues = auditVisualPlan(plan);
  const penalty = issues.reduce((sum, issue) => sum + (issue.includes("chevauchement") ? 1.5 : 0.7), 0);
  return Math.max(0, Math.min(10, 10 - penalty));
}
