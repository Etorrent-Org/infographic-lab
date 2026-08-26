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

function treeContent(spec: CanvasSpec): LayoutBox {
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
  const content = treeContent(spec);
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

export function buildVisualPlan(kind: CustomVisualKind, value: CanonicalInfographic): VisualLayoutPlan {
  if (kind === "tree") return treePlan(value);
  return buildCorePlan(kind, value);
}

export function auditVisualPlan(plan: VisualLayoutPlan) {
  return auditCorePlan(plan);
}

export function structuralScore(plan: VisualLayoutPlan) {
  return scoreCorePlan(plan);
}
