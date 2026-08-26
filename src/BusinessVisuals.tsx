import { CardSurface, ItemCard, TextBlock, ValueText, VisualFrame, visualTheme } from "./VisualPrimitives";
import { charsForWidth, buildVisualPlan, wrapVisualText } from "./visual-layout";
import type { LayoutBox, VisualLayoutPlan } from "./visual-layout";
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

function requireBox(plan: VisualLayoutPlan, id: string) {
  const found = plan.boxes.find((box) => box.id === id);
  if (!found) throw new Error(`Zone de rendu introuvable : ${id}`);
  return found;
}

function itemColor(index: number, palette: string[], fallback: string) {
  return palette[index % Math.max(1, palette.length)] ?? fallback;
}

export function MatrixVisual({ data, style, kind }: Props & { kind: MatrixKind }) {
  const plan = buildVisualPlan(kind as CustomVisualKind, data);
  const theme = visualTheme(style, data);
  const boxes = plan.boxes.filter((box) => box.role === "item");

  return (
    <VisualFrame plan={plan} data={data} style={style} label={matrixLabels[kind]}>
      {boxes.map((box, index) => {
        const item = data.items[index];
        if (!item) return null;
        const color = itemColor(index, theme.palette, theme.accent);
        return (
          <g key={`${kind}-${index}`} data-box-id={box.id}>
            <CardSurface box={box} theme={theme} accent={color} opacity={theme.dark ? 0.12 : 0.075} radius={20} />
            <rect x={box.x + 18} y={box.y + 18} width="28" height="4" rx="2" fill={color} />
            <text x={box.x + 18} y={box.y + 43} fill={color} fontSize="10" fontWeight="880" letterSpacing="1.15">{matrixHeadings[kind][index]}</text>
            <TextBlock
              box={{ ...box, y: box.y + 38, height: Math.max(46, box.height - 38) }}
              title={item.title}
              description={item.description}
              theme={theme}
              titleSize={box.width < 300 ? 15 : 16.5}
              descriptionSize={box.width < 300 ? 10.7 : 11.3}
              titleMaxLines={2}
              descriptionMaxLines={3}
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
  const header = requireBox(plan, "table-header");
  const rows = plan.boxes.filter((box) => box.id.startsWith("table-row"));
  const hasNumeric = numericItems(data.items).length >= 2;
  const titleRatio = hasNumeric ? 0.27 : 0.3;
  const valueRatio = hasNumeric ? 0.18 : 0;
  const descRatio = 1 - titleRatio - valueRatio;

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Table visuelle">
      <rect x={header.x} y={header.y} width={header.width} height={header.height} rx="14" fill={theme.accent} fillOpacity={theme.dark ? 0.16 : 0.1} />
      <text x={header.x + 18} y={header.y + 32} fill={theme.text} fontSize="10" fontWeight="880" letterSpacing="1">ÉLÉMENT</text>
      <text x={header.x + header.width * titleRatio + 18} y={header.y + 32} fill={theme.text} fontSize="10" fontWeight="880" letterSpacing="1">SYNTHÈSE</text>
      {hasNumeric && <text x={header.x + header.width - 18} y={header.y + 32} textAnchor="end" fill={theme.text} fontSize="10" fontWeight="880" letterSpacing="1">VALEUR</text>}

      {rows.map((row, index) => {
        const item = data.items[index];
        if (!item) return null;
        const color = itemColor(index, theme.palette, theme.accent);
        const titleWidth = row.width * titleRatio;
        const descWidth = row.width * descRatio;
        const valueWidth = row.width * valueRatio;
        const titleLines = wrapVisualText(item.title, charsForWidth(titleWidth - 30, 13.5), 2).lines;
        const descLines = wrapVisualText(item.description, charsForWidth(descWidth - 30, 10.8), 2).lines;
        const centerTitleY = row.y + row.height / 2 - Math.max(0, titleLines.length - 1) * 8 + 4;
        const centerDescY = row.y + row.height / 2 - Math.max(0, descLines.length - 1) * 7 + 3;
        return (
          <g key={`table-${index}`} data-box-id={row.id}>
            <rect x={row.x} y={row.y} width={row.width} height={row.height} fill={index % 2 === 0 ? theme.surface : theme.accent} fillOpacity={index % 2 === 0 ? (theme.dark ? 0.08 : 0.42) : (theme.dark ? 0.05 : 0.025)} />
            <rect x={row.x} y={row.y + 10} width="4" height={Math.max(20, row.height - 20)} rx="2" fill={color} />
            <line x1={row.x} x2={row.x + row.width} y1={row.y} y2={row.y} stroke={theme.text} strokeOpacity="0.09" />
            <text x={row.x + 18} y={centerTitleY} fill={theme.text} fontSize="13.5" fontWeight="800">
              {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={row.x + 18} dy={lineIndex === 0 ? 0 : 16}>{line}</tspan>)}
            </text>
            <text x={row.x + titleWidth + 18} y={centerDescY} fill={theme.muted} fontSize="10.8" fontWeight="520">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={row.x + titleWidth + 18} dy={lineIndex === 0 ? 0 : 14}>{line}</tspan>)}
            </text>
            {hasNumeric && valueWidth > 0 && (
              <text x={row.x + row.width - 18} y={row.y + row.height / 2 + 5} textAnchor="end" fill={numericValue(item) !== null ? color : theme.muted} fontSize="14" fontWeight="850">
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
        const color = itemColor(index, theme.palette, theme.accent);
        const labelLines = wrapVisualText(item.title, charsForWidth(box.width - 36, 12), 2).lines;
        const descLines = wrapVisualText(item.description, charsForWidth(box.width - 36, 10.5), 2).lines;
        return (
          <g key={`kpi-${index}`} data-box-id={box.id}>
            <CardSurface box={box} theme={theme} accent={color} opacity={theme.dark ? 0.12 : 0.07} radius={20} />
            <rect x={box.x + 18} y={box.y + 18} width="24" height="4" rx="2" fill={color} />
            <text x={box.x + 18} y={box.y + 45} fill={theme.muted} fontSize="12" fontWeight="760">
              {labelLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 18} dy={lineIndex === 0 ? 0 : 15}>{line}</tspan>)}
            </text>
            <ValueText x={box.x + 18} y={box.y + Math.min(box.height * 0.58, 112)} value={formatNumericValue(item)} theme={theme} accent={color} size={box.width < 250 ? 28 : 34} />
            <text x={box.x + 18} y={box.y + box.height - 34 - Math.max(0, descLines.length - 1) * 13} fill={theme.muted} fontSize="10.5" fontWeight="520">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 18} dy={lineIndex === 0 ? 0 : 14}>{line}</tspan>)}
            </text>
          </g>
        );
      })}
    </VisualFrame>
  );
}
