import { AnnotationBlock, CardSurface, ItemCard, SectionLabel, TextBlock, VisualFrame, visualTheme } from "./VisualPrimitives";
import { buildVisualPlan, classifyIcebergItems, charsForWidth, wrapVisualText } from "./visual-layout";
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
  const topPeakY = shape.y + 22;
  const tipHalf = shape.width * 0.24;
  const bodyTopHalf = shape.width * 0.46;
  const bodyMidHalf = shape.width * 0.34;
  const bodyBottomY = shape.y + shape.height - 20;
  const bodyMidY = waterY + (bodyBottomY - waterY) * 0.68;
  const objectiveBox = plan.boxes.find((box) => box.id === "objective");

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Iceberg">
      <defs>
        <linearGradient id="iceberg-v5-tip" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.dark ? "#F1FAFC" : "#FFFFFF"} stopOpacity="0.98" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.32" : "0.14"} />
        </linearGradient>
        <linearGradient id="iceberg-v5-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.23" : "0.12"} />
          <stop offset="100%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.62" : "0.50"} />
        </linearGradient>
      </defs>

      <g data-role="iceberg-shape">
        <path
          d={`M ${cx - tipHalf} ${waterY - 5} L ${cx - tipHalf * 0.56} ${topPeakY + 48} L ${cx - tipHalf * 0.10} ${topPeakY} L ${cx + tipHalf * 0.18} ${topPeakY + 22} L ${cx + tipHalf} ${waterY - 5} Z`}
          fill="url(#iceberg-v5-tip)"
          stroke={theme.accent}
          strokeWidth="2.5"
        />
        <path
          d={`M ${cx - bodyTopHalf} ${waterY + 8} L ${cx + bodyTopHalf} ${waterY + 8} L ${cx + bodyMidHalf} ${bodyMidY} L ${cx + shape.width * 0.13} ${bodyBottomY - 34} L ${cx} ${bodyBottomY} L ${cx - shape.width * 0.11} ${bodyBottomY - 34} L ${cx - bodyMidHalf} ${bodyMidY} Z`}
          fill="url(#iceberg-v5-body)"
          stroke={theme.accent}
          strokeWidth="2.5"
        />
        <line x1={shape.x + 8} x2={shape.x + shape.width - 8} y1={waterY} y2={waterY} stroke={theme.text} strokeOpacity="0.28" strokeWidth="1.5" />
        <path
          d={`M ${shape.x + 8} ${waterY} q 8 -6 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`}
          fill="none"
          stroke={theme.accent}
          strokeOpacity="0.45"
          strokeWidth="1.8"
        />
        <SectionLabel x={shape.x + 12} y={waterY - 20} label="VISIBLE" theme={theme} />
        <SectionLabel x={shape.x + 12} y={waterY + 34} label="SOUS LA SURFACE" theme={theme} />
      </g>

      {classification.visible.map(({ item, index }, local) => {
        const box = requireBox(plan, `visible-${local}`);
        const color = itemColor(local, theme.palette, theme.accent);
        const targetY = waterY - 72 + local * 46;
        const targetX = cx - tipHalf * (local === 0 ? 0.72 : 0.42);
        const connectorY = box.y + box.height / 2;
        return (
          <g key={`visible-${index}`}>
            <path d={`M ${box.x + box.width} ${connectorY} H ${shape.x - 16} L ${targetX} ${targetY}`} fill="none" stroke={color} strokeOpacity="0.48" strokeWidth="1.5" />
            <circle cx={shape.x - 16} cy={connectorY} r="3" fill={color} />
            <AnnotationBlock box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="SIGNAL VISIBLE" />
          </g>
        );
      })}

      {classification.deep.map(({ item, index }, local) => {
        const box = plan.boxes.find((candidate) => candidate.id === `deep-${local}`);
        if (!box) return null;
        const color = itemColor(local + 1, theme.palette, theme.accent);
        const connectorY = box.y + box.height / 2;
        const depthRatio = classification.deep.length <= 1 ? 0.5 : local / (classification.deep.length - 1);
        const targetY = waterY + 54 + depthRatio * Math.max(40, bodyBottomY - waterY - 94);
        const bodyHalfAtDepth = bodyTopHalf - depthRatio * (bodyTopHalf - shape.width * 0.13);
        const targetX = cx - bodyHalfAtDepth;
        return (
          <g key={`deep-${index}`}>
            <path d={`M ${box.x + box.width} ${connectorY} H ${shape.x - 16} L ${targetX} ${targetY}`} fill="none" stroke={color} strokeOpacity="0.48" strokeWidth="1.5" />
            <circle cx={shape.x - 16} cy={connectorY} r="3" fill={color} />
            <AnnotationBlock
              box={box}
              title={item.title}
              description={item.description}
              theme={theme}
              accent={color}
              eyebrow={`CAUSE PROFONDE ${String(local + 1).padStart(2, "0")}`}
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
          titleSize={13.5}
          descriptionSize={9.8}
          titleMaxLines={1}
          descriptionMaxLines={1}
          opacity={theme.dark ? 0.11 : 0.055}
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
  const r = Math.min(center.width, center.height) * 0.32;
  const items = data.items.slice(0, 7);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Cycle">
      <circle cx={cx} cy={cy} r={r + 28} fill={theme.accent} fillOpacity={theme.dark ? 0.08 : 0.045} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.text} strokeOpacity="0.10" strokeWidth="12" />
      {items.map((item, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / items.length;
        const nextAngle = -Math.PI / 2 + ((index + 0.72) * Math.PI * 2) / items.length;
        const x0 = cx + Math.cos(angle) * r;
        const y0 = cy + Math.sin(angle) * r;
        const x1 = cx + Math.cos(nextAngle) * r;
        const y1 = cy + Math.sin(nextAngle) * r;
        const color = itemColor(index, theme.palette, theme.accent);
        return <path key={`cycle-arc-${index}`} d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={theme.text} fontSize="20" fontWeight="850">CYCLE</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill={theme.muted} fontSize="11" fontWeight="650">{items.length} étapes reliées</text>

      {plan.boxes.filter((box) => box.role === "item").map((box) => {
        const index = box.itemIndex ?? 0;
        const item = items[index];
        if (!item) return null;
        const point = cardCenter(box);
        const dx = point.x - cx;
        const dy = point.y - cy;
        const length = Math.max(1, Math.hypot(dx, dy));
        const ringX = cx + dx / length * (r + 24);
        const ringY = cy + dy / length * (r + 24);
        const cardX = point.x < cx ? box.x + box.width : box.x;
        const color = itemColor(index, theme.palette, theme.accent);
        return (
          <g key={`cycle-card-${index}`}>
            <path d={`M ${ringX} ${ringY} L ${cardX} ${point.y}`} fill="none" stroke={color} strokeOpacity="0.34" strokeWidth="1.4" />
            <circle cx={ringX} cy={ringY} r="5" fill={theme.background} stroke={color} strokeWidth="2.5" />
            <AnnotationBlock box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="ÉTAPE" index={index} />
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
        return <path key={`ribbon-${index}`} d={`M ${node.x} ${node.y} C ${mid} ${node.y}, ${mid} ${next.y}, ${next.x} ${next.y}`} fill="none" stroke={color} strokeOpacity={theme.dark ? 0.28 : 0.22} strokeWidth="24" strokeLinecap="round" />;
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
            <line x1={node.x} y1={centerY} x2={node.x} y2={cardAbove ? box.y + box.height : box.y} stroke={color} strokeWidth="1.4" strokeOpacity="0.42" />
            <circle cx={node.x} cy={centerY} r="19" fill={color} />
            <text x={node.x} y={centerY + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="850">{String(index + 1).padStart(2, "0")}</text>
            <AnnotationBlock box={box} title={item.title} description={item.description} theme={theme} accent={color} />
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
  const spineX = Math.min(...boxes.map((box) => box.x)) - 18;
  return (
    <VisualFrame plan={plan} data={data} style={style} label="Architecture en couches">
      <line x1={spineX} x2={spineX} y1={boxes[0]?.y ?? plan.content.y} y2={(boxes.at(-1)?.y ?? plan.content.y) + (boxes.at(-1)?.height ?? 0)} stroke={theme.accent} strokeOpacity="0.28" strokeWidth="2" />
      {boxes.map((box, index) => {
        const item = data.items[index];
        const color = itemColor(index, theme.palette, theme.accent);
        if (!item) return null;
        return (
          <g key={`architecture-${index}`} data-box-id={box.id}>
            <CardSurface box={box} theme={theme} accent={color} opacity={theme.dark ? 0.12 : 0.065} radius={14} />
            <circle cx={spineX} cy={box.y + box.height / 2} r="5" fill={color} />
            <rect x={box.x} y={box.y} width="7" height={box.height} rx="3.5" fill={color} opacity="0.9" />
            <text x={box.x + 20} y={box.y + 24} fill={color} fontSize="9.5" fontWeight="850" letterSpacing="1.05">NIVEAU {String(index + 1).padStart(2, "0")}</text>
            <TextBlock box={{ ...box, y: box.y + 12, height: box.height - 12 }} title={item.title} description={item.description} theme={theme} titleSize={14.2} descriptionSize={10.2} titleMaxLines={1} descriptionMaxLines={1} />
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
  const titleLines = wrapVisualText(data.title, 21, 2).lines;
  const items = data.items.slice(0, 6);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Hub / radial">
      <circle cx={cx} cy={cy} r={Math.min(center.width, center.height) * 0.38} fill={theme.accent} fillOpacity={theme.dark ? 0.15 : 0.09} stroke={theme.accent} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={Math.min(center.width, center.height) * 0.24} fill={theme.background} fillOpacity={theme.dark ? 0.22 : 0.48} stroke={theme.accent} strokeOpacity="0.22" />
      <text x={cx} y={cy - (titleLines.length - 1) * 9} textAnchor="middle" fill={theme.text} fontSize="15" fontWeight="850">
        {titleLines.map((line, index) => <tspan key={`${line}-${index}`} x={cx} dy={index === 0 ? 0 : 19}>{line}</tspan>)}
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
            <path d={`M ${cx} ${cy} H ${(cx + cardEdgeX) / 2} V ${point.y} H ${cardEdgeX}`} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" />
            <circle cx={cardEdgeX} cy={point.y} r="3" fill={color} />
            <AnnotationBlock box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="AXE" index={index} />
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
      <rect x={root.x} y={root.y} width={root.width} height={root.height} rx="18" fill={theme.accent} fillOpacity={theme.dark ? 0.18 : 0.10} stroke={theme.accent} strokeWidth="2" />
      <text x={rootCenter} y={root.y + 25} textAnchor="middle" fill={theme.accent} fontSize="9" fontWeight="850" letterSpacing="1.2">RACINE</text>
      <text x={rootCenter} y={root.y + 53} textAnchor="middle" fill={theme.text} fontSize="15.5" fontWeight="850">{wrapVisualText(data.title, 34, 1).lines[0]}</text>
      <line x1={rootCenter} y1={root.y + root.height} x2={rootCenter} y2={busY} stroke={theme.accent} strokeWidth="2" />
      {children.length > 0 && <line x1={Math.min(...children.map((box) => box.x + box.width / 2))} x2={Math.max(...children.map((box) => box.x + box.width / 2))} y1={busY} y2={busY} stroke={theme.accent} strokeWidth="2" strokeOpacity="0.42" />}
      {children.map((box, index) => {
        const item = data.items[index];
        if (!item) return null;
        const color = itemColor(index, theme.palette, theme.accent);
        const centerX = box.x + box.width / 2;
        return (
          <g key={`tree-${index}`}>
            <path d={`M ${centerX} ${busY} V ${box.y - 8}`} fill="none" stroke={color} strokeOpacity="0.44" strokeWidth="1.5" />
            <ItemCard box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow="BRANCHE" index={index} titleSize={13} descriptionSize={9.8} titleMaxLines={2} descriptionMaxLines={1} opacity={theme.dark ? 0.11 : 0.055} />
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
        const titleLines = wrapVisualText(item.title, Math.max(10, charsForWidth(r * 1.25, 13.5)), 2).lines;
        return (
          <g key={`venn-circle-${index}`}>
            <circle cx={center.x} cy={center.y} r={r} fill={color} fillOpacity={theme.dark ? 0.23 : 0.15} stroke={color} strokeOpacity="0.72" strokeWidth="2" />
            <text x={center.x} y={center.y - (titleLines.length - 1) * 8} textAnchor="middle" fill={theme.text} fontSize="13.5" fontWeight="850">
              {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={center.x} dy={lineIndex === 0 ? 0 : 16}>{line}</tspan>)}
            </text>
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
            <line x1={point.x} y1={point.y} x2={target.x} y2={target.y} stroke={color} strokeOpacity="0.30" strokeWidth="1.2" />
            <AnnotationBlock box={box} title={item.title} description={item.description} theme={theme} accent={color} eyebrow={`ENSEMBLE ${String.fromCharCode(65 + index)}`} />
          </g>
        );
      })}
    </VisualFrame>
  );
}
