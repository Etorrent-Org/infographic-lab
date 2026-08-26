import { SectionLabel, VisualFrame, visualTheme } from "./VisualPrimitives";
import { buildVisualPlan, charsForWidth, wrapVisualText } from "./visual-layout";
import type { LayoutBox, VisualLayoutPlan } from "./visual-layout";
import { consistentUnit, formatNumericValue, numericItems, numericValue, positiveNumericItems } from "./visual-data";
import type { CanonicalInfographic, InfographicItem, InfographicStyle } from "./types";

type Props = { data: CanonicalInfographic; style: InfographicStyle };

function requireBox(plan: VisualLayoutPlan, id: string) {
  const found = plan.boxes.find((box) => box.id === id);
  if (!found) throw new Error(`Zone de rendu introuvable : ${id}`);
  return found;
}

function itemColor(index: number, palette: string[], fallback: string) {
  return palette[index % Math.max(1, palette.length)] ?? fallback;
}

function numericData(data: CanonicalInfographic, max = 8) {
  return { ...data, items: numericItems(data.items).slice(0, max) } as CanonicalInfographic;
}

function renderCategoryLabel(
  box: LayoutBox,
  item: InfographicItem,
  muted: string,
  align: "start" | "middle" | "end" = "middle",
) {
  const x = align === "start" ? box.x + 4 : align === "end" ? box.x + box.width - 4 : box.x + box.width / 2;
  const lines = wrapVisualText(item.title, charsForWidth(Math.max(60, box.width - 8), 10.2), 2).lines;
  const y = box.y + 18 - Math.max(0, lines.length - 1) * 6;
  return (
    <text x={x} y={y} textAnchor={align} fill={muted} fontSize="10.2" fontWeight="720">
      {lines.map((line, index) => <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 13}>{line}</tspan>)}
      <title>{item.title}</title>
    </text>
  );
}

export function BarVisual({ data, style }: Props) {
  const chartData = numericData(data);
  const plan = buildVisualPlan("chart-bar", chartData);
  const theme = visualTheme(style, data);
  const plot = requireBox(plan, "bar-plot");
  const labels = plan.boxes.filter((box) => box.id.startsWith("bar-label"));
  const values = chartData.items.map((item) => numericValue(item) ?? 0);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = Math.max(1, max - min);
  const xFor = (value: number) => plot.x + ((value - min) / range) * plot.width;
  const zeroX = xFor(0);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Barres">
      <SectionLabel x={plot.x} y={plot.y - 10} label="COMPARAISON DE VALEURS" theme={theme} />
      {Array.from({ length: 5 }, (_, index) => {
        const ratio = index / 4;
        const x = plot.x + ratio * plot.width;
        const value = min + ratio * range;
        return (
          <g key={`grid-${index}`}>
            <line x1={x} x2={x} y1={plot.y} y2={plot.y + plot.height} stroke={theme.text} strokeOpacity="0.075" />
            <text x={x} y={plot.y + plot.height + 15} textAnchor="middle" fill={theme.muted} fontSize="9">{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)}</text>
          </g>
        );
      })}
      <line x1={zeroX} x2={zeroX} y1={plot.y} y2={plot.y + plot.height} stroke={theme.text} strokeOpacity="0.28" strokeWidth="1.4" />

      {labels.map((label, index) => {
        const item = chartData.items[index];
        if (!item) return null;
        const value = values[index];
        const xValue = xFor(value);
        const x = Math.min(zeroX, xValue);
        const width = Math.max(3, Math.abs(xValue - zeroX));
        const barHeight = Math.min(34, Math.max(18, label.height * 0.46));
        const y = label.y + (label.height - barHeight) / 2;
        const color = itemColor(index, theme.palette, theme.accent);
        const rightSpace = plot.x + plot.width - xValue;
        const leftSpace = xValue - plot.x;
        const positiveOutside = value >= 0 && rightSpace >= 82;
        const negativeOutside = value < 0 && leftSpace >= 82;
        const valueX = value >= 0
          ? positiveOutside ? xValue + 10 : xValue - 10
          : negativeOutside ? xValue - 10 : xValue + 10;
        const valueAnchor = value >= 0
          ? positiveOutside ? "start" : "end"
          : negativeOutside ? "end" : "start";
        return (
          <g key={`bar-${index}`}>
            {renderCategoryLabel(label, item, theme.muted, "end")}
            <rect x={x} y={y} width={width} height={barHeight} rx={barHeight / 2} fill={color} opacity="0.86" />
            <text
              x={valueX}
              y={y + barHeight / 2 + 4}
              textAnchor={valueAnchor}
              fill={theme.text}
              fontSize="10.8"
              fontWeight="860"
            >
              {formatNumericValue(item)}
            </text>
          </g>
        );
      })}
    </VisualFrame>
  );
}

function cartesianScale(items: InfographicItem[], plot: LayoutBox) {
  const values = items.map((item) => numericValue(item) ?? 0);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = Math.max(1, max - min);
  const innerTop = plot.y + 24;
  const innerBottom = plot.y + plot.height - 14;
  const innerHeight = Math.max(40, innerBottom - innerTop);
  const yFor = (value: number) => innerBottom - ((value - min) / range) * innerHeight;
  return { values, min, max, range, yFor, zeroY: yFor(0), innerTop, innerBottom };
}

function Grid({ plot, min, range, yFor, theme }: { plot: LayoutBox; min: number; range: number; yFor: (value: number) => number; theme: ReturnType<typeof visualTheme> }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => {
        const value = min + (index / 4) * range;
        const y = yFor(value);
        return (
          <g key={`grid-${index}`}>
            <line x1={plot.x} x2={plot.x + plot.width} y1={y} y2={y} stroke={theme.text} strokeOpacity="0.075" />
            <text x={plot.x - 9} y={y + 3} textAnchor="end" fill={theme.muted} fontSize="9">{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)}</text>
          </g>
        );
      })}
    </>
  );
}

export function ColumnVisual({ data, style }: Props) {
  const chartData = numericData(data);
  const plan = buildVisualPlan("chart-column", chartData);
  const theme = visualTheme(style, data);
  const plot = requireBox(plan, "cartesian-plot");
  const labels = plan.boxes.filter((box) => box.role === "label");
  const { values, min, range, yFor, zeroY, innerTop } = cartesianScale(chartData.items, plot);
  const slot = plot.width / Math.max(1, chartData.items.length);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Colonnes">
      <Grid plot={plot} min={min} range={range} yFor={yFor} theme={theme} />
      <line x1={plot.x} x2={plot.x + plot.width} y1={zeroY} y2={zeroY} stroke={theme.text} strokeOpacity="0.30" strokeWidth="1.4" />
      {chartData.items.map((item, index) => {
        const value = values[index];
        const yValue = yFor(value);
        const width = Math.min(72, slot * 0.58);
        const x = plot.x + index * slot + (slot - width) / 2;
        const y = Math.min(zeroY, yValue);
        const height = Math.max(3, Math.abs(zeroY - yValue));
        const color = itemColor(index, theme.palette, theme.accent);
        const label = labels[index];
        const above = value >= 0;
        const tightTop = above && y < innerTop + 20;
        const valueY = tightTop ? y + 18 : above ? y - 9 : y + height + 16;
        const valueFill = tightTop ? "#FFFFFF" : theme.text;
        return (
          <g key={`column-${index}`}>
            <rect x={x} y={y} width={width} height={height} rx="8" fill={color} opacity="0.88" />
            <text x={x + width / 2} y={valueY} textAnchor="middle" fill={valueFill} fontSize="10.5" fontWeight="860">{formatNumericValue(item)}</text>
            {label && renderCategoryLabel(label, item, theme.muted)}
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function LineVisual({ data, style }: Props) {
  const chartData = numericData(data);
  const plan = buildVisualPlan("chart-line", chartData);
  const theme = visualTheme(style, data);
  const plot = requireBox(plan, "cartesian-plot");
  const labels = plan.boxes.filter((box) => box.role === "label");
  const { values, min, range, yFor, zeroY, innerTop } = cartesianScale(chartData.items, plot);
  const step = chartData.items.length > 1 ? plot.width / (chartData.items.length - 1) : 0;
  const points = chartData.items.map((_, index) => ({ x: plot.x + index * step, y: yFor(values[index]) }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Courbe">
      <Grid plot={plot} min={min} range={range} yFor={yFor} theme={theme} />
      <line x1={plot.x} x2={plot.x + plot.width} y1={zeroY} y2={zeroY} stroke={theme.text} strokeOpacity="0.20" />
      <path d={path} fill="none" stroke={theme.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => {
        const item = chartData.items[index];
        const color = itemColor(index, theme.palette, theme.accent);
        const label = labels[index];
        const labelBelow = point.y < innerTop + 22;
        return (
          <g key={`line-${index}`}>
            <circle cx={point.x} cy={point.y} r="8" fill={theme.background} stroke={color} strokeWidth="4" />
            <text x={point.x} y={labelBelow ? point.y + 26 : point.y - 15} textAnchor="middle" fill={theme.text} fontSize="10.5" fontWeight="860">{formatNumericValue(item)}</text>
            {label && renderCategoryLabel(label, item, theme.muted)}
          </g>
        );
      })}
    </VisualFrame>
  );
}

function donutParts(items: InfographicItem[]) {
  const positive = positiveNumericItems(items);
  const semanticParts = positive.filter((item) => !/\b(total|progression|variation|[eé]cart|delta|diff[eé]rence|[eé]volution)\b/i.test(`${item.title} ${item.category ?? ""}`));
  const pool = semanticParts.length >= 2 ? semanticParts : positive;
  if (pool.length <= 2) return pool.slice(0, 6);
  const values = pool.map((item) => numericValue(item) ?? 0);
  const totalIndex = values.findIndex((value, index) => {
    const others = values.reduce((sum, candidate, candidateIndex) => candidateIndex === index ? sum : sum + candidate, 0);
    return others > 0 && Math.abs(value - others) / Math.max(value, others) < 0.001;
  });
  return pool.filter((_, index) => index !== totalIndex).slice(0, 6);
}

export function DonutVisual({ data, style }: Props) {
  const items = donutParts(data.items);
  const chartData: CanonicalInfographic = { ...data, items };
  const plan = buildVisualPlan("chart-donut", chartData);
  const theme = visualTheme(style, data);
  const shape = requireBox(plan, "donut-shape");
  const legend = plan.boxes.filter((box) => box.id.startsWith("donut-legend"));
  const values = items.map((item) => numericValue(item) ?? 0);
  const total = Math.max(1, values.reduce((sum, value) => sum + value, 0));
  const unit = consistentUnit(items);
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  const r = Math.min(shape.width, shape.height) * 0.26;
  const circumference = Math.PI * 2 * r;
  let offset = 0;

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Donut">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.text} strokeOpacity="0.07" strokeWidth="58" />
      {items.map((item, index) => {
        const share = (numericValue(item) ?? 0) / total;
        const length = share * circumference;
        const currentOffset = offset;
        offset += length;
        return (
          <circle
            key={`donut-segment-${index}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={itemColor(index, theme.palette, theme.accent)}
            strokeWidth="58"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-currentOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 12} textAnchor="middle" fill={theme.muted} fontSize="10" fontWeight="850" letterSpacing="1.2">TOTAL DES PARTS</text>
      <text x={cx} y={cy + 25} textAnchor="middle" fill={theme.text} fontSize="28" fontWeight="880">{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(total)}{unit ? ` ${unit}` : ""}</text>

      {legend.map((box, index) => {
        const item = items[index];
        if (!item) return null;
        const color = itemColor(index, theme.palette, theme.accent);
        const share = (numericValue(item) ?? 0) / total;
        const labelLines = wrapVisualText(item.title, charsForWidth(box.width - 120, 11.5), 2).lines;
        return (
          <g key={`donut-legend-${index}`} data-box-id={box.id}>
            <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="14" fill={theme.surface} fillOpacity={theme.dark ? 0.82 : 0.96} />
            <rect x={box.x} y={box.y} width="5" height={box.height} rx="2.5" fill={color} />
            <circle cx={box.x + 20} cy={box.y + box.height / 2} r="5" fill={color} />
            <text x={box.x + 34} y={box.y + box.height / 2 - Math.max(0, labelLines.length - 1) * 7 + 4} fill={theme.text} fontSize="11.5" fontWeight="760">
              {labelLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 34} dy={lineIndex === 0 ? 0 : 14}>{line}</tspan>)}
            </text>
            <text x={box.x + box.width - 14} y={box.y + box.height / 2 - 4} textAnchor="end" fill={color} fontSize="11" fontWeight="860">{formatNumericValue(item)}</text>
            <text x={box.x + box.width - 14} y={box.y + box.height / 2 + 14} textAnchor="end" fill={theme.muted} fontSize="9.5" fontWeight="700">{new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 }).format(share)}</text>
          </g>
        );
      })}
    </VisualFrame>
  );
}

export function WaterfallVisual({ data, style }: Props) {
  const chartData = numericData(data);
  const plan = buildVisualPlan("chart-waterfall", chartData);
  const theme = visualTheme(style, data);
  const plot = requireBox(plan, "cartesian-plot");
  const labels = plan.boxes.filter((box) => box.role === "label");
  const deltas = chartData.items.map((item) => numericValue(item) ?? 0);
  const starts: number[] = [];
  const ends: number[] = [];
  let running = 0;
  deltas.forEach((delta) => {
    starts.push(running);
    running += delta;
    ends.push(running);
  });
  const extrema = [0, ...starts, ...ends];
  const min = Math.min(...extrema);
  const max = Math.max(...extrema);
  const range = Math.max(1, max - min);
  const innerTop = plot.y + 24;
  const innerBottom = plot.y + plot.height - 14;
  const yFor = (value: number) => innerBottom - ((value - min) / range) * (innerBottom - innerTop);
  const slot = plot.width / Math.max(1, chartData.items.length);

  return (
    <VisualFrame plan={plan} data={data} style={style} label="Waterfall chiffré">
      <Grid plot={plot} min={min} range={range} yFor={yFor} theme={theme} />
      {chartData.items.map((item, index) => {
        const start = starts[index];
        const end = ends[index];
        const yStart = yFor(start);
        const yEnd = yFor(end);
        const y = Math.min(yStart, yEnd);
        const height = Math.max(4, Math.abs(yStart - yEnd));
        const width = Math.min(68, slot * 0.58);
        const x = plot.x + index * slot + (slot - width) / 2;
        const delta = deltas[index];
        const color = delta >= 0 ? "#138A72" : "#D6455D";
        const label = labels[index];
        const tightTop = delta >= 0 && y < innerTop + 20;
        const valueY = tightTop ? y + 18 : delta >= 0 ? y - 10 : y + height + 16;
        return (
          <g key={`waterfall-${index}`}>
            {index > 0 && <line x1={plot.x + (index - 1) * slot + slot / 2} x2={x} y1={yStart} y2={yStart} stroke={theme.text} strokeOpacity="0.22" strokeDasharray="5 5" />}
            <rect x={x} y={y} width={width} height={height} rx="7" fill={color} opacity="0.88" />
            <text x={x + width / 2} y={valueY} textAnchor="middle" fill={tightTop ? "#FFFFFF" : theme.text} fontSize="10.5" fontWeight="860">{formatNumericValue(item)}</text>
            {label && renderCategoryLabel(label, item, theme.muted)}
          </g>
        );
      })}
    </VisualFrame>
  );
}
