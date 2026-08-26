import { ItemCard, SectionLabel, TextBlock, VisualFrame, visualTheme } from "./VisualPrimitives";
import { buildVisualPlan, classifyIcebergItems, cleanVisualText, wrapVisualText } from "./visual-layout";
import type { LayoutBox, VisualLayoutPlan } from "./visual-layout";
import type { CanonicalInfographic, InfographicStyle } from "./types";

type Props = { data: CanonicalInfographic; style: InfographicStyle };

function requireBox(plan: VisualLayoutPlan, id: string) {
  const found = plan.boxes.find((box) => box.id === id);
  if (!found) throw new Error(`Zone de rendu introuvable : ${id}`);
  return found;
}

function cardCenter(box: LayoutBox) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

function itemColor(index: number, palette: string[], fallback: string) {
  return palette[index % Math.max(1, palette.length)] ?? fallback;
}

export function IcebergVisual({ data, style }: Props) {
  const plan = buildVisualPlan("iceberg", data);
  const theme = visualTheme(style, data);
  const shape = requireBox(plan, "iceberg-shape");
  const classification = classifyIcebergItems(data);
  const waterY = Number(plan.meta.waterY);
  const cx = shape.x + shape.width / 2;
  const topPeakY = shape.y + 28;
  const tipHalf = shape.width * 0.22;
  const bodyTopHalf = shape.width * 0.45;
  const bodyMidHalf = shape.width * 0.34;
  const bodyBottomY = shape.y + shape.height - 20;
  const bodyMidY = waterY + (bodyBottomY - waterY) * 0.72;
  const objectiveBox = plan.boxes.find((box) => box.id === "objective");

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Iceberg">
      <defs>
        <linearGradient id="iceberg-v4-tip" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.dark ? "#E9F4F8" : "#FFFFFF"} stopOpacity="0.98" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.28" : "0.16"} />
        </linearGradient>
        <linearGradient id="iceberg-v4-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.28" : "0.18"} />
          <stop offset="100%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.58" : "0.46"} />
        </linearGradient>
      </defs>

      <g data-role="iceberg-shape">
        <path
          d={`M ${cx - tipHalf} ${waterY - 5} L ${cx - tipHalf * 0.48} ${topPeakY + 36} L ${cx - tipHalf * 0.1} ${topPeakY} L ${cx + tipHalf * 0.16} ${topPeakY + 18} L ${cx + tipHalf} ${waterY - 5} Z`}
          fill="url(#iceberg-v4-tip)"
          stroke={theme.accent}
          strokeWidth="2.5"
        />
        <path
          d={`M ${cx - bodyTopHalf} ${waterY + 8} L ${cx + bodyTopHalf} ${waterY + 8} L ${cx + bodyMidHalf} ${bodyMidY} L ${cx + shape.width * 0.13} ${bodyBottomY - 34} L ${cx} ${bodyBottomY} L ${cx - shape.width * 0.11} ${bodyBottomY - 34} L ${cx - bodyMidHalf} ${bodyMidY} Z`}
          fill="url(#iceberg-v4-body)"
          stroke={theme.accent}
          strokeWidth="2.5"
        />
        <line x1={shape.x + 10} x2={shape.x + shape.width - 10} y1={waterY} y2={waterY} stroke={theme.text} strokeOpacity="0.34" strokeWidth="1.5" />
        <path
          d={`M ${shape.x + 6} ${waterY} q 8 -7 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`}
          fill="none"
          stroke={theme.accent}
          strokeOpacity="0.48"
          strokeWidth="2"
        />
        <SectionLabel x={shape.x + 16} y={waterY - 18} label="VISIBLE" theme={theme} />
        <SectionLabel x={shape.x + 16} y={waterY + 32} label="SOUS LA SURFACE" theme={theme} />
      </g>

      {classification.visible.map(({ item, index }, local) => {
        const box = requireBox(plan, `visible-${local}`);
        const color = itemColor(local, theme.palette, theme.accent);
        const targetY = waterY - 22 - local * 42;
        return (
          <g key={`visible-${index}`}>
            <path d={`M ${box.x + box.width} ${box.y + box.height / 2} H ${shape.x - 18} L ${cx - tipHalf * 0.68} ${targetY}`} fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="1.6" />
            <circle cx={shape.x - 18} cy={box.y + box.height / 2} r="3.5" fill={color} />
            <ItemCard
              box={box}
              title={item.title}
              description={item.description}
              theme={theme}
              accent={color}
              eyebrow="SIGNAL VISIBLE"
              titleSize={14.5}
              descriptionSize={10.8}
              titleMaxLines={1}
              descriptionMaxLines={2}
            />
          </g>
        );
      })}

      {classification.deep.map(({ item, index }, local) => {
        const box = plan.boxes.find((candidate) => candidate.id === `deep-${local}`);
        if (!box) return null;
        const color = itemColor(local + 1, theme.palette, theme.accent);
        const anchorY = box.y + box.height / 2;
        const depthRatio = classification.deep.length <= 1 ? 0.5 : local / (classification.deep.length - 1);
        const targetY = waterY + 48 + depthRatio * Math.max(40, bodyBottomY - waterY - 86);
        const targetX = cx - bodyTopHalf + depthRatio * (bodyTopHalf - shape.width * 0.12);
        return (
          <g key={`deep-${index}`}>
            <path d={`M ${box.x + box.width} ${anchorY} H ${shape.x - 16} L ${targetX} ${targetY}`} fill="none" stroke={color} strokeOpacity="0.54" strokeWidth="1.6" />
            <circle cx={shape.x - 16} cy={anchorY} r="3.5" fill={color} />
            <ItemCard
              box={box}
              title={item.title}
              description={item.description}
              theme={theme}
              accent={color}
              eyebrow={`CAUSE PROFONDE ${String(local + 1).padStart(2, "0")}`}
              titleSize={14.5}
              descriptionSize={10.8}
              titleMaxLines={2}
              descriptionMaxLines={2}
            />
          </g>
        );
      })}

      {classification.objective && objectiveBox && (
        <ItemCard
          box={objectiveBox}
          title={classification.objective.item.title}
          description={classification.objective.item.description}
          theme={theme}
          accent={theme.accent}
          eyebrow="CAP / OBJECTIF"
          titleSize={14}
          descriptionSize={10.8}
          titleMaxLines={1}
          descriptionMaxLines={2}
        />
      )}
    </VisualFrame>
  );
}

export function CycleVisual({ data, style }: Props) {
  const plan = buildVisualPlan("cycle", data);
  const theme = visualTheme(style, data);
  const center = requireBox(plan, "center-shape");
  const cx = center.x + center.width / 2;
  const cy = center.y + center.height / 2;
  const r = Math.min(center.width, center.height) * 0.34;
  const items = data.items.slice(0, 7);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Cycle">
      <defs>
        <marker id="cycle-arrow-v4" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 Z" fill={theme.accent} />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={r + 28} fill={theme.accent} fillOpacity="0.045" />
      {[0, 1, 2, 3].map((quarter) => {
        const a0 = -Math.PI / 2 + quarter * Math.PI / 2 + 0.08;
        const a1 = a0 + Math.PI / 2 - 0.18;
        const x0 = cx + Math.cos(a0) * r;
        const y0 = cy + Math.sin(a0) * r;
        const x1 = cx + Math.cos(a1) * r;
        const y1 = cy + Math.sin(a1) * r;
        return <path key={quarter} d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={theme.accent} strokeWidth="8" strokeLinecap="round" markerEnd="url(#cycle-arrow-v4)" opacity="0.8" />;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={theme.text} fontSize="21" fontWeight="850">CYCLE</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill={theme.muted} fontSize="11.5" fontWeight="600">{items.length} étapes reliées</text>

      {plan.boxes.filter((box) => box.role === "item").map((box) => {
        const index = box.itemIndex ?? 0;
        const item = items[index];
        if (!item) return null;
        const point = cardCenter(box);
        const dx = point.x - cx;
        const dy = point.y - cy;
        const length = Math.max(1, Math.hypot(dx, dy));
        const ringX = cx + dx / length * (r + 30);
        const ringY = cy + dy / length * (r + 30);
        const cardX = point.x < cx ? box.x + box.width : box.x;
        const color = itemColor(index, theme.palette, theme.accent);
        return (
          <g key={`cycle-card-${index}`}>
            <line x1={ringX} y1={ringY} x2={cardX} y2={point.y} stroke={color} strokeOpacity="0.42" strokeWidth="1.5" />
            <circle cx={ringX} cy={ringY} r="4" fill={color} />
            <ItemCard box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="ÉTAPE" index={index} titleSize={14} descriptionSize={10.5} titleMaxLines={2} descriptionMaxLines={2} />
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function SankeyVisual({ data, style }: Props) {
  const plan = buildVisualPlan("sankey", data);
  const theme = visualTheme(style, data);
  const plot = requireBox(plan, "sankey-ribbon");
  const itemBoxes = plan.boxes.filter((box) => box.role === "item").sort((a, b) => (a.itemIndex ?? 0) - (b.itemIndex ?? 0));
  const centerY = plot.y + plot.height / 2;
  const nodes = itemBoxes.map((box) => ({ x: box.x + box.width / 2, y: centerY }));

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Sankey narratif">
      <SectionLabel x={plot.x} y={plot.y - 14} label="FLUX NARRATIF · LARGEUR NON QUANTITATIVE" theme={theme} />
      {nodes.slice(0, -1).map((node, index) => {
        const next = nodes[index + 1];
        const mid = (node.x + next.x) / 2;
        const color = itemColor(index, theme.palette, theme.accent);
        return <path key={`ribbon-${index}`} d={`M ${node.x} ${node.y} C ${mid} ${node.y}, ${mid} ${next.y}, ${next.x} ${next.y}`} fill="none" stroke={color} strokeOpacity="0.24" strokeWidth="30" strokeLinecap="round" />;
      })}
      {itemBoxes.map((box) => {
        const index = box.itemIndex ?? 0;
        const item = data.items[index];
        const node = nodes[index];
        const color = itemColor(index, theme.palette, theme.accent);
        if (!item || !node) return null;
        const cardAbove = box.y < centerY;
        return (
          <g key={`sankey-${index}`}>
            <line x1={node.x} y1={centerY} x2={node.x} y2={cardAbove ? box.y + box.height : box.y} stroke={color} strokeWidth="1.5" strokeOpacity="0.48" />
            <circle cx={node.x} cy={centerY} r="21" fill={color} />
            <text x={node.x} y={centerY + 4} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="850">{String(index + 1).padStart(2, "0")}</text>
            <ItemCard box={box} title={item.title} description={item.description} theme={theme} accent={color} titleSize={13.5} descriptionSize={10} titleMaxLines={2} descriptionMaxLines={2} />
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function ArchitectureVisual({ data, style }: Props) {
  const plan = buildVisualPlan("architecture", data);
  const theme = visualTheme(style, data);
  const boxes = plan.boxes.filter((box) => box.role === "item");
  const spineX = Math.min(...boxes.map((box) => box.x)) - 16;
  return (
    <VisualFrame plan={plan} data={data} style={style} label="Architecture en couches">
      <line x1={spineX} x2={spineX} y1={boxes[0]?.y ?? plan.content.y} y2={(boxes.at(-1)?.y ?? plan.content.y) + (boxes.at(-1)?.height ?? 0)} stroke={theme.accent} strokeOpacity="0.3" strokeWidth="2" />
      {boxes.map((box, index) => {
        const item = data.items[index];
        const color = itemColor(index, theme.palette, theme.accent);
        if (!item) return null;
        return (
          <g key={`architecture-${index}`}>
            <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="16" fill={color} fillOpacity={theme.dark ? 0.12 : 0.08} stroke={color} strokeOpacity="0.28" />
            <circle cx={spineX} cy={box.y + box.height / 2} r="5" fill={color} />
            <text x={box.x + 18} y={box.y + 24} fill={color} fontSize="9.5" fontWeight="850" letterSpacing="1.1">NIVEAU {String(index + 1).padStart(2, "0")}</text>
            <TextBlock box={{ ...box, y: box.y + 12, height: box.height - 12 }} title={item.title} description={item.description} theme={theme} titleSize={14.5} descriptionSize={10.7} titleMaxLines={1} descriptionMaxLines={2} />
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function HubVisual({ data, style }: Props) {
  const plan = buildVisualPlan("hub", data);
  const theme = visualTheme(style, data);
  const center = requireBox(plan, "center-shape");
  const cx = center.x + center.width / 2;
  const cy = center.y + center.height / 2;
  const titleLines = wrapVisualText(data.title, 22, 2).lines;
  const items = data.items.slice(0, 6);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Hub / radial">
      <circle cx={cx} cy={cy} r={Math.min(center.width, center.height) * 0.35} fill={theme.accent} fillOpacity="0.12" stroke={theme.accent} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={Math.min(center.width, center.height) * 0.22} fill={theme.accent} fillOpacity="0.08" />
      <text x={cx} y={cy - (titleLines.length - 1) * 9} textAnchor="middle" fill={theme.text} fontSize="16" fontWeight="850">
        {titleLines.map((line, index) => <tspan key={`${line}-${index}`} x={cx} dy={index === 0 ? 0 : 20}>{line}</tspan>)}
      </text>
      {plan.boxes.filter((box) => box.role === "item").map((box) => {
        const index = box.itemIndex ?? 0;
        const item = items[index];
        if (!item) return null;
        const point = cardCenter(box);
        const cardEdgeX = point.x < cx ? box.x + box.width : box.x;
        const color = itemColor(index, theme.palette, theme.accent);
        return (
          <g key={`hub-${index}`}>
            <path d={`M ${cx} ${cy} H ${(cx + cardEdgeX) / 2} V ${point.y} H ${cardEdgeX}`} fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1.6" />
            <ItemCard box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="AXE" index={index} titleSize={14} descriptionSize={10.5} titleMaxLines={2} descriptionMaxLines={2} />
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function TreeVisual({ data, style }: Props) {
  const plan = buildVisualPlan("tree", data);
  const theme = visualTheme(style, data);
  const root = requireBox(plan, "tree-root");
  const children = plan.boxes.filter((box) => box.id.startsWith("tree-child"));
  const busY = root.y + root.height + 26;
  const rootCenter = root.x + root.width / 2;

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Hiérarchie / arbre">
      <rect x={root.x} y={root.y} width={root.width} height={root.height} rx="18" fill={theme.accent} fillOpacity="0.13" stroke={theme.accent} strokeWidth="2" />
      <text x={rootCenter} y={root.y + 31} textAnchor="middle" fill={theme.accent} fontSize="9.5" fontWeight="850" letterSpacing="1.2">RACINE</text>
      <text x={rootCenter} y={root.y + 55} textAnchor="middle" fill={theme.text} fontSize="16" fontWeight="850">{wrapVisualText(data.title, 34, 1).lines[0]}</text>
      <line x1={rootCenter} y1={root.y + root.height} x2={rootCenter} y2={busY} stroke={theme.accent} strokeWidth="2" />
      {children.length > 0 && <line x1={Math.min(...children.map((box) => box.x + box.width / 2))} x2={Math.max(...children.map((box) => box.x + box.width / 2))} y1={busY} y2={busY} stroke={theme.accent} strokeWidth="2" strokeOpacity="0.5" />}
      {children.map((box, index) => {
        const item = data.items[index];
        if (!item) return null;
        const color = itemColor(index, theme.palette, theme.accent);
        const centerX = box.x + box.width / 2;
        return (
          <g key={`tree-${index}`}>
            <path d={`M ${centerX} ${busY} V ${box.y - 8}`} fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" />
            <ItemCard box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="BRANCHE" index={index} titleSize={13.5} descriptionSize={10.2} titleMaxLines={2} descriptionMaxLines={2} />
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function VennVisual({ data, style }: Props) {
  const plan = buildVisualPlan("venn", data);
  const theme = visualTheme(style, data);
  const shape = requireBox(plan, "venn-shape");
  const items = data.items.slice(0, 3);
  const count = items.length;
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  const r = Math.min(shape.width, shape.height) * (count === 2 ? 0.31 : 0.28);
  const centers = count === 2
    ? [{ x: cx - r * 0.62, y: cy }, { x: cx + r * 0.62, y: cy }]
    : [{ x: cx - r * 0.58, y: cy - r * 0.18 }, { x: cx + r * 0.58, y: cy - r * 0.18 }, { x: cx, y: cy + r * 0.62 }];

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Venn">
      {items.map((item, index) => {
        const center = centers[index];
        const color = itemColor(index, theme.palette, theme.accent);
        return (
          <g key={`venn-circle-${index}`}>
            <circle cx={center.x} cy={center.y} r={r} fill={color} fillOpacity={theme.dark ? 0.2 : 0.16} stroke={color} strokeOpacity="0.7" strokeWidth="2" />
            <text x={center.x} y={center.y + 5} textAnchor="middle" fill={theme.text} fontSize="17" fontWeight="880" opacity="0.78">{String.fromCharCode(65 + index)}</text>
          </g>
        );
      })}
      {plan.boxes.filter((box) => box.role === "item").map((box, index) => {
        const item = items[index];
        if (!item) return null;
        const color = itemColor(index, theme.palette, theme.accent);
        const target = centers[index];
        const point = cardCenter(box);
        return (
          <g key={`venn-card-${index}`}>
            <line x1={point.x} y1={point.y} x2={target.x} y2={target.y} stroke={color} strokeOpacity="0.35" strokeWidth="1.3" />
            <ItemCard box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow={`ENSEMBLE ${String.fromCharCode(65 + index)}`} titleSize={13.5} descriptionSize={10.2} titleMaxLines={2} descriptionMaxLines={2} />
          </g>
        );
      })}
    </VisualFrame>
  );
}
