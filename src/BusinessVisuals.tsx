import { CardSurface, TextBlock, ValueText, VisualFrame, visualTheme } from "./VisualPrimitives";
import { charsForWidth, buildVisualPlan, wrapVisualText } from "./visual-layout";
import type { VisualLayoutPlan } from "./visual-layout";
import { formatNumericValue, numericItems, numericValue } from "./visual-data";
import type { CanonicalInfographic, CustomVisualKind, InfographicStyle } from "./types";

type Props = { data: CanonicalInfographic; style: InfographicStyle };
type MatrixKind = "matrix" | "swot" | "impact" | "eisenhower" | "risk";

const matrixHeadings: Record<MatrixKind, string[]> = {
  matrix: ["AXE 1", "AXE 2", "AXE 3", "AXE 4"],
  swot: ["FORCES", "FAIBLESSES", "OPPORTUNITÉS", "MENACES"],
  impact: ["QUICK WINS", "PROJETS MAJEURS", "PETITS GAINS", "À ÉVITER"],
  eisenhower: ["FAIRE", "PLANIFIER", "DÉLÉGUER", "ÉLIMINER"],
  risk: ["FAIBLE", "MODÉRÉ", "ÉLEVÉ", "CRITIQUE"],
};

const matrixLabels: Record<MatrixKind, string> = {
  matrix: "Matrice 2×2",
  swot: "SWOT",
  impact: "Impact / Effort",
  eisenhower: "Matrice Eisenhower",
  risk: "Matrice de risque",
};

const semanticColors: Record<Exclude<MatrixKind, "matrix">, string[]> = {
  swot: ["#138A72", "#D97706", "#2563EB", "#D6455D"],
  impact: ["#138A72", "#2563EB", "#64748B", "#D6455D"],
  eisenhower: ["#D6455D", "#D97706", "#2563EB", "#64748B"],
  risk: ["#138A72", "#D6A20B", "#E56A14", "#C7354A"],
};

function matrixColors(kind: MatrixKind, palette: string[], accent: string) {
  if (kind === "matrix") return [accent, palette[1] ?? "#2563EB", palette[2] ?? "#0F8A7A", palette[3] ?? "#D97706"];
  return semanticColors[kind];
}

function axisCopy(kind: MatrixKind) {
  if (kind === "impact") return { x: "EFFORT →", y: "IMPACT ↑" };
  if (kind === "eisenhower") return { x: "URGENCE →", y: "IMPORTANCE ↑" };
  if (kind === "risk") return { x: "PROBABILITÉ →", y: "IMPACT ↑" };
  return null;
}

export function MatrixVisual({ data, style, kind }: Props & { kind: MatrixKind }) {
  const plan = buildVisualPlan(kind as CustomVisualKind, data);
  const theme = visualTheme(style, data);
  const boxes = plan.boxes.filter((box) => box.role === "item");
  const colors = matrixColors(kind, theme.palette, theme.accent);
  const axes = axisCopy(kind);
  const xMid = plan.content.x + plan.content.width / 2;
  const yMid = plan.content.y + plan.content.height / 2;

  return (
    <VisualFrame plan={plan} data={data} style={style} label={matrixLabels[kind]}>
      {axes && (
        <g opacity="0.75">
          <text x={plan.content.x + 4} y={plan.content.y + 18} fill={theme.muted} fontSize="9.5" fontWeight="850" letterSpacing="1">{axes.y}</text>
          <text x={plan.content.x + plan.content.width - 4} y={plan.content.y + plan.content.height - 4} textAnchor="end" fill={theme.muted} fontSize="9.5" fontWeight="850" letterSpacing="1">{axes.x}</text>
          <line x1={xMid} x2={xMid} y1={plan.content.y + 24} y2={plan.content.y + plan.content.height - 22} stroke={theme.text} strokeOpacity="0.08" strokeDasharray="4 8" />
          <line x1={plan.content.x + 24} x2={plan.content.x + plan.content.width - 24} y1={yMid} y2={yMid} stroke={theme.text} strokeOpacity="0.08" strokeDasharray="4 8" />
        </g>
      )}
      {boxes.map((box, index) => {
        const item = data.items[index];
        if (!item) return null;
        const color = colors[index] ?? theme.accent;
        return (
          <g key={`${kind}-${index}`} data-box-id={box.id}>
            <CardSurface box={box} theme={theme} accent={color} opacity={theme.dark ? 0.16 : 0.095} radius={20} />
            <rect x={box.x} y={box.y} width={box.width} height="7" rx="3.5" fill={color} opacity="0.92" />
            <text x={box.x + 18} y={box.y + 32} fill={color} fontSize="10" fontWeight="900" letterSpacing="1.1">{matrixHeadings[kind][index]}</text>
            <TextBlock
              box={{ ...box, y: box.y + 34, height: Math.max(46, box.height - 34) }}
              title={item.title}
              description={item.description}
              theme={theme}
              titleSize={box.width < 300 ? 15 : 16.5}
              descriptionSize={box.width < 300 ? 10.3 : 11}
              titleMaxLines={2}
              descriptionMaxLines={2}
            />
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function TableVisual({ data, style }: Props) {
  const plan = buildVisualPlan("table", data);
  const theme = visualTheme(style, data);
  const header = plan.boxes.find((box) => box.id === "table-header");
  if (!header) throw new Error("En-tête de table introuvable.");
  const rows = plan.boxes.filter((box) => box.id.startsWith("table-row"));
  const hasNumeric = numericItems(data.items).length >= 2;
  const titleRatio = hasNumeric ? 0.26 : 0.3;
  const valueRatio = hasNumeric ? 0.18 : 0;
  const descRatio = 1 - titleRatio - valueRatio;

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Table visuelle">
      <rect x={header.x} y={header.y} width={header.width} height={header.height} rx="14" fill={theme.accent} fillOpacity={theme.dark ? 0.24 : 0.14} />
      <text x={header.x + 18} y={header.y + 31} fill={theme.text} fontSize="10" fontWeight="900" letterSpacing="1">ÉLÉMENT</text>
      <text x={header.x + header.width * titleRatio + 18} y={header.y + 31} fill={theme.text} fontSize="10" fontWeight="900" letterSpacing="1">SYNTHÈSE</text>
      {hasNumeric && <text x={header.x + header.width - 18} y={header.y + 31} textAnchor="end" fill={theme.text} fontSize="10" fontWeight="900" letterSpacing="1">VALEUR</text>}

      {rows.map((row, index) => {
        const item = data.items[index];
        if (!item) return null;
        const color = theme.palette[index % theme.palette.length] ?? theme.accent;
        const titleWidth = row.width * titleRatio;
        const descWidth = row.width * descRatio;
        const valueWidth = row.width * valueRatio;
        const titleLines = wrapVisualText(item.title, charsForWidth(titleWidth - 30, 13), 2).lines;
        const descLines = wrapVisualText(item.description, charsForWidth(descWidth - 30, 10.5), 2).lines;
        const centerTitleY = row.y + row.height / 2 - Math.max(0, titleLines.length - 1) * 7 + 4;
        const centerDescY = row.y + row.height / 2 - Math.max(0, descLines.length - 1) * 6 + 3;
        return (
          <g key={`table-${index}`} data-box-id={row.id}>
            <rect x={row.x} y={row.y} width={row.width} height={row.height} rx="10" fill={index % 2 === 0 ? theme.surface : theme.surfaceStrong} fillOpacity={theme.dark ? 0.84 : 0.96} />
            <rect x={row.x} y={row.y + 10} width="4" height={Math.max(20, row.height - 20)} rx="2" fill={color} />
            <text x={row.x + 18} y={centerTitleY} fill={theme.text} fontSize="13" fontWeight="820">
              {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={row.x + 18} dy={lineIndex === 0 ? 0 : 15}>{line}</tspan>)}
            </text>
            <text x={row.x + titleWidth + 18} y={centerDescY} fill={theme.muted} fontSize="10.5" fontWeight="520">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={row.x + titleWidth + 18} dy={lineIndex === 0 ? 0 : 13}>{line}</tspan>)}
            </text>
            {hasNumeric && valueWidth > 0 && (
              <text x={row.x + row.width - 18} y={row.y + row.height / 2 + 5} textAnchor="end" fill={numericValue(item) !== null ? color : theme.muted} fontSize="14" fontWeight="880">
                {numericValue(item) !== null ? formatNumericValue(item) : "—"}
              </text>
            )}
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function KPIVisual({ data, style }: Props) {
  const items = numericItems(data.items).slice(0, 6);
  const numericData: CanonicalInfographic = { ...data, items };
  const plan = buildVisualPlan("kpi", numericData);
  const theme = visualTheme(style, data);
  const boxes = plan.boxes.filter((box) => box.role === "item");

  return (
    <VisualFrame plan={plan} data={data} style={style} label="KPI">
      {boxes.map((box, index) => {
        const item = items[index];
        if (!item) return null;
        const color = theme.palette[index % theme.palette.length] ?? theme.accent;
        const labelLines = wrapVisualText(item.title, charsForWidth(box.width - 36, 11.5), 2).lines;
        const descLines = wrapVisualText(item.description, charsForWidth(box.width - 36, 10), 1).lines;
        return (
          <g key={`kpi-${index}`} data-box-id={box.id}>
            <CardSurface box={box} theme={theme} accent={color} opacity={theme.dark ? 0.15 : 0.08} radius={20} />
            <rect x={box.x} y={box.y} width={box.width} height="7" rx="3.5" fill={color} />
            <text x={box.x + 18} y={box.y + 35} fill={theme.muted} fontSize="11.5" fontWeight="760">
              {labelLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 18} dy={lineIndex === 0 ? 0 : 14}>{line}</tspan>)}
            </text>
            <ValueText x={box.x + 18} y={box.y + Math.min(box.height * 0.59, 116)} value={formatNumericValue(item)} theme={theme} accent={color} size={box.width < 250 ? 28 : 34} />
            <text x={box.x + 18} y={box.y + box.height - 26} fill={theme.muted} fontSize="10" fontWeight="520">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 18} dy={lineIndex === 0 ? 0 : 13}>{line}</tspan>)}
            </text>
          </g>
        );
      })}
    </VisualFrame>
  );
}
