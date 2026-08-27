import {
  auditVisualPlan as auditCorePlan,
  boxesOverlap,
  buildVisualPlan as buildCorePlan,
  canvasSpec,
  charsForWidth,
  classifyIcebergItems,
  cleanVisualText,
  structuralScore as scoreCorePlan,
  wrapVisualText,
} from "./visual-layout-core.ts";
import type {
  CanvasSpec,
  IcebergClassification,
  LayoutBox,
  LayoutBoxRole,
  VisualLayoutPlan,
  WrappedText,
} from "./visual-layout-core.ts";
import type { CanonicalInfographic, CustomVisualKind } from "./types";

export {
  boxesOverlap,
  canvasSpec,
  charsForWidth,
  classifyIcebergItems,
  cleanVisualText,
  wrapVisualText,
};
export type {
  CanvasSpec,
  IcebergClassification,
  LayoutBox,
  LayoutBoxRole,
  VisualLayoutPlan,
  WrappedText,
};

function visualContent(spec: CanvasSpec): LayoutBox {
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

function treePlan(value: CanonicalInfographic): VisualLayoutPlan {
  const spec = canvasSpec(value);
  const content = visualContent(spec);
  const count = Math.min(8, value.items.length);
  const portrait = spec.width < 900;
  const rootWidth = portrait ? 280 : 320;
  const rootHeight = 76;
  const root: LayoutBox = {
    id: "tree-root",
    x: content.x + (content.width - rootWidth) / 2,
    y: content.y + 10,
    width: rootWidth,
    height: rootHeight,
    role: "root",
  };
  const childTop = root.y + root.height + 58;
  const columns = portrait ? 2 : Math.min(4, Math.max(2, count));
  const rows = Math.max(1, Math.ceil(count / columns));
  const insetX = portrait ? 20 : 16;
  const gapX = portrait ? 16 : 14;
  const gapY = portrait ? 20 : 18;
  const regionWidth = content.width - insetX * 2;
  const cardWidth = (regionWidth - gapX * Math.max(0, columns - 1)) / columns;
  const availableHeight = content.y + content.height - childTop - 8;
  const naturalHeight = (availableHeight - gapY * Math.max(0, rows - 1)) / rows;
  const cardHeight = Math.max(94, Math.min(portrait ? 154 : 142, naturalHeight));
  const groupHeight = rows * cardHeight + gapY * Math.max(0, rows - 1);
  const verticalOffset = Math.max(0, Math.min(30, (availableHeight - groupHeight) * 0.12));
  const startY = childTop + verticalOffset;
  const boxes: LayoutBox[] = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return {
      id: `tree-child-${index}`,
      x: content.x + insetX + col * (cardWidth + gapX),
      y: startY + row * (cardHeight + gapY),
      width: cardWidth,
      height: cardHeight,
      role: "item",
      itemIndex: index,
    };
  });
  return {
    kind: "tree",
    spec,
    content,
    boxes: [root, ...boxes],
    meta: { columns, rows, cardHeight, cardWidth },
  };
}

function architecturePlan(value: CanonicalInfographic): VisualLayoutPlan {
  const spec = canvasSpec(value);
  const content = visualContent(spec);
  const count = Math.min(6, value.items.length);
  const portrait = spec.width < 900;
  const square = spec.width >= 900 && spec.width < 1000;
  const outerX = portrait ? 30 : 40;
  const outerY = 20;
  const gap = 16;
  const region: LayoutBox = {
    id: "architecture-region",
    x: content.x + outerX,
    y: content.y + outerY,
    width: content.width - outerX * 2,
    height: content.height - outerY * 2,
    role: "plot",
    allowOverlap: true,
  };
  const naturalHeight = count > 0
    ? (region.height - gap * Math.max(0, count - 1)) / count
    : region.height;
  const maximumHeight = portrait ? 220 : square ? 190 : 160;
  const layerHeight = Math.min(maximumHeight, naturalHeight);
  const groupHeight = count * layerHeight + gap * Math.max(0, count - 1);
  const startY = region.y + Math.max(0, (region.height - groupHeight) / 2);
  const boxes: LayoutBox[] = Array.from({ length: count }, (_, index) => {
    const inset = Math.min(region.width * 0.12, index * (portrait ? 12 : 18));
    return {
      id: `architecture-${index}`,
      x: region.x + inset,
      y: startY + index * (layerHeight + gap),
      width: region.width - inset * 2,
      height: layerHeight,
      role: "item",
      itemIndex: index,
    };
  });
  return {
    kind: "architecture",
    spec,
    content,
    boxes,
    meta: { count, layerHeight, groupHeight },
  };
}

function tablePlan(value: CanonicalInfographic): VisualLayoutPlan {
  const spec = canvasSpec(value);
  const content = visualContent(spec);
  const count = Math.min(8, value.items.length);
  const portrait = spec.width < 900;
  const square = spec.width >= 900 && spec.width < 1000;
  const marginX = spec.width < 1000 ? 34 : 28;
  const marginY = spec.width < 1000 ? 30 : 22;
  const headerHeight = 48;
  const headerGap = 12;
  const rowGap = spec.width < 1000 ? 10 : 8;
  const tableX = content.x + marginX;
  const tableWidth = content.width - marginX * 2;
  const availableRowsHeight = content.height - marginY * 2 - headerHeight - headerGap;
  const naturalRowHeight = count > 0
    ? (availableRowsHeight - rowGap * Math.max(0, count - 1)) / count
    : availableRowsHeight;
  const maximumRowHeight = portrait ? 190 : square ? 180 : 144;
  const rowHeight = Math.min(maximumRowHeight, naturalRowHeight);
  const rowsHeight = count * rowHeight + rowGap * Math.max(0, count - 1);
  const totalHeight = headerHeight + headerGap + rowsHeight;
  const topOffset = Math.max(marginY, (content.height - totalHeight) / 2);
  const header: LayoutBox = {
    id: "table-header",
    x: tableX,
    y: content.y + topOffset,
    width: tableWidth,
    height: headerHeight,
    role: "label",
  };
  const rowsStartY = header.y + header.height + headerGap;
  const rows: LayoutBox[] = Array.from({ length: count }, (_, index) => ({
    id: `table-row-${index}`,
    x: tableX,
    y: rowsStartY + index * (rowHeight + rowGap),
    width: tableWidth,
    height: rowHeight,
    role: "item",
    itemIndex: index,
  }));
  return {
    kind: "table",
    spec,
    content,
    boxes: [header, ...rows],
    meta: { headerHeight, rowHeight, totalHeight },
  };
}

function kpiPlan(value: CanonicalInfographic): VisualLayoutPlan {
  const spec = canvasSpec(value);
  const content = visualContent(spec);
  const count = Math.min(6, value.items.length);
  const portrait = spec.width < 900;
  const square = spec.width >= 900 && spec.width < 1000;
  const preferredColumns = portrait ? 2 : 3;
  const columns = Math.max(1, Math.min(preferredColumns, Math.max(1, count)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const insetX = portrait ? 36 : 32;
  const insetY = portrait ? 32 : 24;
  const gap = portrait ? 22 : 20;
  const region: LayoutBox = {
    id: "kpi-region",
    x: content.x + insetX,
    y: content.y + insetY,
    width: content.width - insetX * 2,
    height: content.height - insetY * 2,
    role: "plot",
    allowOverlap: true,
  };
  if (count === 0) {
    return { kind: "kpi", spec, content, boxes: [], meta: { columns: 0, rows: 0 } };
  }
  const naturalWidth = (region.width - gap * Math.max(0, columns - 1)) / columns;
  const naturalHeight = (region.height - gap * Math.max(0, rows - 1)) / rows;
  const maximumWidth = portrait ? 320 : square ? 300 : 340;
  const maximumHeight = portrait ? 200 : square ? 200 : 180;
  const cardWidth = Math.min(maximumWidth, naturalWidth);
  const cardHeight = Math.min(maximumHeight, naturalHeight);
  const gridHeight = rows * cardHeight + gap * Math.max(0, rows - 1);
  const startY = region.y + Math.max(0, (region.height - gridHeight) / 2);
  const boxes: LayoutBox[] = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const rowCount = Math.min(columns, count - row * columns);
    const rowWidth = rowCount * cardWidth + gap * Math.max(0, rowCount - 1);
    const rowStartX = region.x + Math.max(0, (region.width - rowWidth) / 2);
    return {
      id: `kpi-${index}`,
      x: rowStartX + col * (cardWidth + gap),
      y: startY + row * (cardHeight + gap),
      width: cardWidth,
      height: cardHeight,
      role: "item",
      itemIndex: index,
    };
  });
  return {
    kind: "kpi",
    spec,
    content,
    boxes,
    meta: { columns, rows, cardWidth, cardHeight },
  };
}

export function buildVisualPlan(kind: CustomVisualKind, value: CanonicalInfographic): VisualLayoutPlan {
  if (kind === "tree") return treePlan(value);
  if (kind === "architecture") return architecturePlan(value);
  if (kind === "table") return tablePlan(value);
  if (kind === "kpi") return kpiPlan(value);
  return buildCorePlan(kind, value);
}

export function auditVisualPlan(plan: VisualLayoutPlan) {
  return auditCorePlan(plan);
}

export function structuralScore(plan: VisualLayoutPlan) {
  return scoreCorePlan(plan);
}
