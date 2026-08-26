import type { ReactNode } from "react";
import { getVisualColors } from "./antv";
import type { CanonicalInfographic, CustomVisualKind, InfographicItem, InfographicStyle } from "./types";

type Props = {
  kind: CustomVisualKind;
  data: CanonicalInfographic;
  style: InfographicStyle;
};

type CanvasSpec = { width: number; height: number };

function canvasSpec(data: CanonicalInfographic): CanvasSpec {
  const orientation = data.appearance?.orientation ?? "auto";
  if (orientation === "portrait") return { width: 820, height: 1120 };
  if (orientation === "square") return { width: 900, height: 900 };
  return { width: 1120, height: 680 };
}

function shortLines(text: string, maxChars = 34, maxLines = 3) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  const consumed = lines.join(" ").length;
  if (consumed < text.trim().length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]+$/, "")}…`;
  }
  return lines;
}

function valueOf(item: InfographicItem) {
  if (typeof item.value === "number" && Number.isFinite(item.value)) return item.value;
  const candidate = `${item.title} ${item.description}`.replace(/(\d),(\d)/g, "$1.$2");
  const match = candidate.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function valueLabel(item: InfographicItem, fallback?: number | null) {
  const value = typeof item.value === "number" ? item.value : fallback;
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)}${item.unit ? ` ${item.unit}` : ""}`;
}

function Frame({
  data,
  style,
  label,
  children,
}: {
  data: CanonicalInfographic;
  style: InfographicStyle;
  label: string;
  children: (spec: CanvasSpec, textColor: string, palette: string[]) => ReactNode;
}) {
  const spec = canvasSpec(data);
  const colors = getVisualColors(style, data);
  const textColor = colors.dark ? "#F8FAFC" : "#172033";
  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${spec.width} ${spec.height}`} role="img" aria-label={`${label} : ${data.title}`}>
      <rect width={spec.width} height={spec.height} rx="26" fill={colors.background} />
      <Header data={data} spec={spec} color={textColor} accent={colors.accent} />
      {children(spec, textColor, colors.palette)}
    </svg>
  );
}

function Header({ data, spec, color, accent }: { data: CanonicalInfographic; spec: CanvasSpec; color: string; accent: string }) {
  const titleLines = shortLines(data.title, spec.width < 900 ? 34 : 48, 2);
  const titleSize = spec.width < 900 ? 30 : 34;
  return (
    <g>
      <rect x="54" y="38" width="6" height="58" rx="3" fill={accent} />
      <text x="78" y="60" fill={color} fontSize={titleSize} fontWeight="780">
        {titleLines.map((line, index) => <tspan key={`${line}-${index}`} x="78" dy={index === 0 ? 0 : titleSize + 5}>{line}</tspan>)}
      </text>
      {data.subtitle && (
        <text x="78" y={64 + titleLines.length * (titleSize + 5)} fill={color} fontSize="15" opacity="0.66">
          {shortLines(data.subtitle, spec.width < 900 ? 60 : 90, 2).map((line, index) => <tspan key={`${line}-${index}`} x="78" dy={index === 0 ? 0 : 20}>{line}</tspan>)}
        </text>
      )}
    </g>
  );
}

function ItemCopy({ item, x, y, color, width = 260, align = "start" }: { item: InfographicItem; x: number; y: number; color: string; width?: number; align?: "start" | "middle" | "end" }) {
  const title = shortLines(item.title, Math.max(14, Math.round(width / 9)), 2);
  const desc = shortLines(item.description, Math.max(22, Math.round(width / 7.5)), 2);
  return (
    <g>
      <text x={x} y={y} fill={color} fontSize="16" fontWeight="760" textAnchor={align}>
        {title.map((line, index) => <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 19}>{line}</tspan>)}
      </text>
      <text x={x} y={y + 27 + Math.max(0, title.length - 1) * 19} fill={color} fontSize="12" opacity="0.68" textAnchor={align}>
        {desc.map((line, index) => <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 17}>{line}</tspan>)}
      </text>
    </g>
  );
}

function Iceberg({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Iceberg">
      {(spec, text, palette) => {
        const cx = spec.width / 2;
        const waterY = spec.height * 0.42;
        const topY = spec.height * 0.21;
        const bottomY = spec.height * 0.88;
        const visibleCount = Math.max(1, Math.min(2, Math.ceil(data.items.length * 0.34)));
        return (
          <g>
            <defs>
              <linearGradient id="iceTop" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#F8FCFF" /><stop offset="100%" stopColor="#C9E2EC" /></linearGradient>
              <linearGradient id="iceBottom" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#9CCADB" /><stop offset="100%" stopColor="#5C87A4" /></linearGradient>
            </defs>
            <path d={`M ${cx - 92} ${waterY - 14} L ${cx - 38} ${topY} L ${cx + 10} ${topY - 24} L ${cx + 92} ${waterY - 14} Z`} fill="url(#iceTop)" stroke={palette[0]} strokeWidth="3" />
            <path d={`M ${cx - 188} ${waterY + 14} L ${cx + 188} ${waterY + 14} L ${cx + 120} ${bottomY} L ${cx} ${bottomY + 18} L ${cx - 128} ${bottomY - 16} Z`} fill="url(#iceBottom)" stroke={palette[0]} strokeWidth="3" />
            <line x1="48" x2={spec.width - 48} y1={waterY} y2={waterY} stroke={palette[1] ?? palette[0]} strokeWidth="5" opacity="0.7" />
            <text x="58" y={waterY - 14} fill={text} fontSize="11" fontWeight="750" opacity="0.58">VISIBLE</text>
            <text x="58" y={waterY + 30} fill={text} fontSize="11" fontWeight="750" opacity="0.58">SOUS LA SURFACE</text>
            {data.items.map((item, index) => {
              const above = index < visibleCount;
              const local = above ? index : index - visibleCount;
              const side = local % 2 === 0 ? -1 : 1;
              const row = Math.floor(local / 2);
              const y = above ? topY + 20 + index * 76 : waterY + 105 + row * 106;
              const anchorX = cx + side * (above ? 86 : 150);
              const textX = side < 0 ? Math.max(210, anchorX - 110) : Math.min(spec.width - 210, anchorX + 110);
              const align = side < 0 ? "end" : "start";
              const color = palette[index % palette.length];
              return (
                <g key={`ice-${index}`}>
                  <line x1={anchorX} y1={y + 6} x2={side < 0 ? textX + 18 : textX - 18} y2={y + 6} stroke={color} strokeWidth="2" />
                  <circle cx={anchorX} cy={y + 6} r="5" fill={color} />
                  <ItemCopy item={item} x={textX} y={y} color={text} width={220} align={align} />
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function Cycle({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Cycle">
      {(spec, text, palette) => {
        const cx = spec.width / 2;
        const cy = spec.height * 0.58;
        const radius = Math.min(spec.width, spec.height) * 0.27;
        const count = data.items.length;
        return (
          <g>
            <circle cx={cx} cy={cy} r={radius * 0.52} fill="none" stroke={palette[0]} strokeOpacity="0.18" strokeWidth="28" />
            <text x={cx} y={cy - 3} textAnchor="middle" fill={text} fontSize="20" fontWeight="780">BOUCLE</text>
            <text x={cx} y={cy + 24} textAnchor="middle" fill={text} fontSize="12" opacity="0.62">amélioration continue</text>
            {data.items.map((item, index) => {
              const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
              const x = cx + Math.cos(angle) * radius;
              const y = cy + Math.sin(angle) * radius;
              const color = palette[index % palette.length];
              return (
                <g key={`cycle-${index}`}>
                  <circle cx={x} cy={y} r="48" fill={color} opacity="0.16" />
                  <circle cx={x} cy={y} r="40" fill="none" stroke={color} strokeWidth="3" />
                  <text x={x} y={y - 4} textAnchor="middle" fill={text} fontSize="12" fontWeight="750">
                    {shortLines(item.title, 13, 2).map((line, li) => <tspan key={`${line}-${li}`} x={x} dy={li ? 15 : 0}>{line}</tspan>)}
                  </text>
                  <text x={x} y={y + 28} textAnchor="middle" fill={text} fontSize="10" opacity="0.6">{String(index + 1).padStart(2, "0")}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function Sankey({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Sankey narratif">
      {(spec, text, palette) => {
        const startX = 110;
        const endX = spec.width - 110;
        const step = data.items.length > 1 ? (endX - startX) / (data.items.length - 1) : 0;
        const centerY = spec.height * 0.56;
        return (
          <g>
            <text x="58" y={spec.height * 0.2} fill={text} fontSize="11" fontWeight="750" opacity="0.55">FLUX NARRATIF · NON QUANTITATIF</text>
            {data.items.slice(0, -1).map((_, index) => {
              const x1 = startX + index * step;
              const x2 = startX + (index + 1) * step;
              const y1 = centerY + Math.sin(index * 1.3) * 62;
              const y2 = centerY + Math.sin((index + 1) * 1.3) * 62;
              const mid = (x1 + x2) / 2;
              return <path key={`flow-${index}`} d={`M ${x1 + 25} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2 - 25} ${y2}`} fill="none" stroke={palette[index % palette.length]} strokeOpacity="0.28" strokeWidth="28" strokeLinecap="round" />;
            })}
            {data.items.map((item, index) => {
              const x = startX + index * step;
              const y = centerY + Math.sin(index * 1.3) * 62;
              const cardY = index % 2 === 0 ? y - 122 : y + 68;
              const color = palette[index % palette.length];
              return (
                <g key={`node-${index}`}>
                  <circle cx={x} cy={y} r="30" fill={color} />
                  <text x={x} y={y + 5} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">{String(index + 1).padStart(2, "0")}</text>
                  <line x1={x} x2={x} y1={index % 2 === 0 ? y - 30 : y + 30} y2={index % 2 === 0 ? cardY + 42 : cardY - 12} stroke={color} strokeWidth="2" />
                  <ItemCopy item={item} x={x} y={cardY} color={text} width={Math.max(120, step - 16)} align="middle" />
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

const matrixHeadings: Record<"matrix" | "swot" | "impact" | "eisenhower" | "risk", string[]> = {
  matrix: ["AXE 1", "AXE 2", "AXE 3", "AXE 4"],
  swot: ["FORCES", "FAIBLESSES", "OPPORTUNITÉS", "MENACES"],
  impact: ["QUICK WINS", "PROJETS MAJEURS", "PETITS GAINS", "À ÉVITER"],
  eisenhower: ["FAIRE", "PLANIFIER", "DÉLÉGUER", "ÉLIMINER"],
  risk: ["FAIBLE", "MODÉRÉ", "ÉLEVÉ", "CRITIQUE"],
};

function MatrixPreset({ data, style, kind }: Omit<Props, "kind"> & { kind: "matrix" | "swot" | "impact" | "eisenhower" | "risk" }) {
  return (
    <Frame data={data} style={style} label={matrixHeadings[kind].join(" / ")}>
      {(spec, text, palette) => {
        const left = 60;
        const top = spec.height * 0.24;
        const gap = 14;
        const cellW = (spec.width - left * 2 - gap) / 2;
        const cellH = (spec.height - top - 54 - gap) / 2;
        return (
          <g>
            {data.items.slice(0, 4).map((item, index) => {
              const col = index % 2;
              const row = Math.floor(index / 2);
              const x = left + col * (cellW + gap);
              const y = top + row * (cellH + gap);
              const color = palette[index % palette.length];
              return (
                <g key={`${kind}-${index}`}>
                  <rect x={x} y={y} width={cellW} height={cellH} rx="18" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
                  <text x={x + 22} y={y + 30} fill={color} fontSize="11" fontWeight="850" letterSpacing="1.2">{matrixHeadings[kind][index]}</text>
                  <ItemCopy item={item} x={x + 22} y={y + 62} color={text} width={cellW - 44} />
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function Architecture({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Architecture en couches">
      {(spec, text, palette) => {
        const top = spec.height * 0.24;
        const available = spec.height - top - 48;
        const layerH = Math.max(64, Math.min(94, available / data.items.length - 8));
        return (
          <g>
            {data.items.map((item, index) => {
              const inset = Math.min(spec.width * 0.2, index * 18);
              const x = 70 + inset;
              const width = spec.width - 140 - inset * 2;
              const y = top + index * (layerH + 8);
              const color = palette[index % palette.length];
              return (
                <g key={`layer-${index}`}>
                  <rect x={x} y={y} width={width} height={layerH} rx="16" fill={color} opacity="0.14" stroke={color} strokeWidth="2" />
                  <text x={x + 22} y={y + 27} fill={color} fontSize="11" fontWeight="850">NIVEAU {String(index + 1).padStart(2, "0")}</text>
                  <text x={x + 22} y={y + 52} fill={text} fontSize="16" fontWeight="760">{shortLines(item.title, 42, 1)[0]}</text>
                  <text x={x + 22} y={y + 72} fill={text} fontSize="11" opacity="0.62">{shortLines(item.description, 80, 1)[0]}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function Hub({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Carte radiale">
      {(spec, text, palette) => {
        const cx = spec.width / 2;
        const cy = spec.height * 0.58;
        const radius = Math.min(spec.width, spec.height) * 0.3;
        return (
          <g>
            <circle cx={cx} cy={cy} r="84" fill={palette[0]} opacity="0.16" stroke={palette[0]} strokeWidth="3" />
            <text x={cx} y={cy - 4} textAnchor="middle" fill={text} fontSize="17" fontWeight="800">{shortLines(data.title, 20, 2).map((line, i) => <tspan key={`${line}-${i}`} x={cx} dy={i ? 20 : 0}>{line}</tspan>)}</text>
            {data.items.map((item, index) => {
              const angle = -Math.PI / 2 + (index * Math.PI * 2) / data.items.length;
              const x = cx + Math.cos(angle) * radius;
              const y = cy + Math.sin(angle) * radius;
              const color = palette[index % palette.length];
              return (
                <g key={`hub-${index}`}>
                  <line x1={cx + Math.cos(angle) * 86} y1={cy + Math.sin(angle) * 86} x2={x} y2={y} stroke={color} strokeWidth="3" opacity="0.55" />
                  <rect x={x - 78} y={y - 38} width="156" height="76" rx="18" fill={color} opacity="0.13" stroke={color} strokeWidth="2" />
                  <text x={x} y={y - 3} textAnchor="middle" fill={text} fontSize="13" fontWeight="760">{shortLines(item.title, 20, 2).map((line, i) => <tspan key={`${line}-${i}`} x={x} dy={i ? 16 : 0}>{line}</tspan>)}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function TableVisual({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Table visuelle">
      {(spec, text, palette) => {
        const top = spec.height * 0.24;
        const left = 58;
        const width = spec.width - 116;
        const rowH = Math.max(54, Math.min(78, (spec.height - top - 44) / (data.items.length + 1)));
        const hasNumeric = data.items.some((item) => typeof item.value === "number");
        return (
          <g>
            <rect x={left} y={top} width={width} height={rowH} rx="14" fill={palette[0]} opacity="0.16" />
            <text x={left + 18} y={top + rowH / 2 + 5} fill={text} fontSize="11" fontWeight="850">ÉLÉMENT</text>
            <text x={left + width * 0.34} y={top + rowH / 2 + 5} fill={text} fontSize="11" fontWeight="850">SYNTHÈSE</text>
            {hasNumeric && <text x={left + width - 18} y={top + rowH / 2 + 5} textAnchor="end" fill={text} fontSize="11" fontWeight="850">VALEUR</text>}
            {data.items.map((item, index) => {
              const y = top + rowH * (index + 1);
              return (
                <g key={`row-${index}`}>
                  <line x1={left} x2={left + width} y1={y} y2={y} stroke={palette[index % palette.length]} strokeOpacity="0.22" />
                  <text x={left + 18} y={y + rowH / 2 + 5} fill={text} fontSize="13" fontWeight="760">{shortLines(item.title, 26, 1)[0]}</text>
                  <text x={left + width * 0.34} y={y + rowH / 2 + 5} fill={text} fontSize="11" opacity="0.66">{shortLines(item.description, hasNumeric ? 54 : 76, 1)[0]}</text>
                  {hasNumeric && <text x={left + width - 18} y={y + rowH / 2 + 5} textAnchor="end" fill={palette[index % palette.length]} fontSize="14" fontWeight="850">{valueLabel(item, valueOf(item))}</text>}
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function KPI({ data, style }: Omit<Props, "kind">) {
  const items = data.items.filter((item) => valueOf(item) !== null).slice(0, 6);
  return (
    <Frame data={data} style={style} label="KPI">
      {(spec, text, palette) => {
        const columns = spec.width < 900 ? 2 : 3;
        const rows = Math.ceil(items.length / columns);
        const left = 54;
        const top = spec.height * 0.26;
        const gap = 16;
        const cardW = (spec.width - left * 2 - gap * (columns - 1)) / columns;
        const cardH = Math.min(180, (spec.height - top - 44 - gap * Math.max(0, rows - 1)) / Math.max(1, rows));
        return (
          <g>
            {items.map((item, index) => {
              const col = index % columns;
              const row = Math.floor(index / columns);
              const x = left + col * (cardW + gap);
              const y = top + row * (cardH + gap);
              const color = palette[index % palette.length];
              const numeric = valueOf(item);
              return (
                <g key={`kpi-${index}`}>
                  <rect x={x} y={y} width={cardW} height={cardH} rx="20" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
                  <text x={x + 22} y={y + 34} fill={text} fontSize="12" fontWeight="750" opacity="0.7">{shortLines(item.title, 24, 1)[0]}</text>
                  <text x={x + 22} y={y + 86} fill={color} fontSize={cardW < 220 ? 28 : 36} fontWeight="850">{valueLabel(item, numeric)}</text>
                  <text x={x + 22} y={y + 116} fill={text} fontSize="11" opacity="0.58">{shortLines(item.description, 42, 1)[0]}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function Venn({ data, style }: Omit<Props, "kind">) {
  const items = data.items.slice(0, 3);
  return (
    <Frame data={data} style={style} label="Venn">
      {(spec, text, palette) => {
        const cx = spec.width / 2;
        const cy = spec.height * 0.58;
        const r = Math.min(spec.width, spec.height) * 0.2;
        const centers = items.length === 2
          ? [{ x: cx - r * 0.55, y: cy }, { x: cx + r * 0.55, y: cy }]
          : [{ x: cx - r * 0.55, y: cy - r * 0.2 }, { x: cx + r * 0.55, y: cy - r * 0.2 }, { x: cx, y: cy + r * 0.62 }];
        return (
          <g>
            {items.map((item, index) => {
              const center = centers[index];
              const color = palette[index % palette.length];
              return (
                <g key={`venn-${index}`}>
                  <circle cx={center.x} cy={center.y} r={r} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="3" />
                  <text x={center.x} y={center.y - 4} textAnchor="middle" fill={text} fontSize="15" fontWeight="800">{shortLines(item.title, 18, 2).map((line, i) => <tspan key={`${line}-${i}`} x={center.x} dy={i ? 18 : 0}>{line}</tspan>)}</text>
                </g>
              );
            })}
            <text x={cx} y={cy + (items.length === 2 ? 6 : 18)} textAnchor="middle" fill={text} fontSize="11" fontWeight="750" opacity="0.62">ZONE COMMUNE</text>
          </g>
        );
      }}
    </Frame>
  );
}

function Tree({ data, style }: Omit<Props, "kind">) {
  return (
    <Frame data={data} style={style} label="Hiérarchie">
      {(spec, text, palette) => {
        const cx = spec.width / 2;
        const top = spec.height * 0.28;
        const items = data.items.slice(0, 8);
        const columns = spec.width < 900 ? 2 : Math.min(4, items.length);
        const rows = Math.ceil(items.length / columns);
        const gap = 14;
        const left = 52;
        const cardW = (spec.width - left * 2 - gap * (columns - 1)) / columns;
        const rowH = Math.min(132, (spec.height - top - 140) / Math.max(1, rows));
        return (
          <g>
            <rect x={cx - 130} y={top} width="260" height="72" rx="18" fill={palette[0]} opacity="0.16" stroke={palette[0]} strokeWidth="2" />
            <text x={cx} y={top + 42} textAnchor="middle" fill={text} fontSize="17" fontWeight="820">{shortLines(data.title, 28, 1)[0]}</text>
            <line x1={cx} y1={top + 72} x2={cx} y2={top + 102} stroke={palette[0]} strokeWidth="3" />
            <line x1={left + cardW / 2} x2={spec.width - left - cardW / 2} y1={top + 102} y2={top + 102} stroke={palette[0]} strokeWidth="3" opacity="0.55" />
            {items.map((item, index) => {
              const col = index % columns;
              const row = Math.floor(index / columns);
              const x = left + col * (cardW + gap);
              const y = top + 124 + row * (rowH + gap);
              const color = palette[index % palette.length];
              return (
                <g key={`tree-${index}`}>
                  {row === 0 && <line x1={x + cardW / 2} y1={top + 102} x2={x + cardW / 2} y2={y} stroke={color} strokeWidth="2" />}
                  <rect x={x} y={y} width={cardW} height={rowH} rx="16" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
                  <ItemCopy item={item} x={x + 18} y={y + 30} color={text} width={cardW - 36} />
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function ChartBar({ data, style }: Omit<Props, "kind">) {
  const items = data.items.filter((item) => valueOf(item) !== null);
  return (
    <Frame data={data} style={style} label="Graphique en barres">
      {(spec, text, palette) => {
        const left = spec.width < 900 ? 165 : 205;
        const right = 92;
        const top = spec.height * 0.27;
        const availableW = spec.width - left - right;
        const rowH = (spec.height - top - 48) / Math.max(1, items.length);
        const max = Math.max(...items.map((item) => Math.abs(valueOf(item) ?? 0)), 1);
        return (
          <g>
            {items.map((item, index) => {
              const numeric = valueOf(item) ?? 0;
              const barW = Math.max(4, Math.abs(numeric) / max * availableW);
              const y = top + index * rowH;
              const color = palette[index % palette.length];
              return (
                <g key={`bar-${index}`}>
                  <text x={left - 16} y={y + rowH * 0.55} textAnchor="end" fill={text} fontSize="12" fontWeight="700">{shortLines(item.title, 22, 1)[0]}</text>
                  <rect x={left} y={y + rowH * 0.22} width={barW} height={Math.max(18, rowH * 0.5)} rx="9" fill={color} opacity="0.82" />
                  <text x={Math.min(spec.width - 12, left + barW + 12)} y={y + rowH * 0.55} fill={text} fontSize="12" fontWeight="800">{valueLabel(item, numeric)}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function ChartColumn({ data, style }: Omit<Props, "kind">) {
  const items = data.items.filter((item) => valueOf(item) !== null);
  return (
    <Frame data={data} style={style} label="Graphique en colonnes">
      {(spec, text, palette) => {
        const left = 70;
        const right = 52;
        const top = spec.height * 0.26;
        const bottom = spec.height - 90;
        const plotH = bottom - top;
        const slot = (spec.width - left - right) / Math.max(1, items.length);
        const max = Math.max(...items.map((item) => Math.abs(valueOf(item) ?? 0)), 1);
        return (
          <g>
            <line x1={left} x2={spec.width - right} y1={bottom} y2={bottom} stroke={text} strokeOpacity="0.22" />
            {items.map((item, index) => {
              const numeric = valueOf(item) ?? 0;
              const h = Math.max(6, Math.abs(numeric) / max * plotH);
              const width = Math.max(28, slot * 0.56);
              const x = left + index * slot + (slot - width) / 2;
              const color = palette[index % palette.length];
              return (
                <g key={`column-${index}`}>
                  <rect x={x} y={bottom - h} width={width} height={h} rx="8" fill={color} opacity="0.82" />
                  <text x={x + width / 2} y={bottom - h - 10} textAnchor="middle" fill={text} fontSize="12" fontWeight="800">{valueLabel(item, numeric)}</text>
                  <text x={x + width / 2} y={bottom + 24} textAnchor="middle" fill={text} fontSize="11" opacity="0.7">{shortLines(item.title, 14, 1)[0]}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function ChartLine({ data, style }: Omit<Props, "kind">) {
  const items = data.items.filter((item) => valueOf(item) !== null);
  return (
    <Frame data={data} style={style} label="Courbe">
      {(spec, text, palette) => {
        const left = 72;
        const right = 62;
        const top = spec.height * 0.27;
        const bottom = spec.height - 92;
        const values = items.map((item) => valueOf(item) ?? 0);
        const min = Math.min(...values, 0);
        const max = Math.max(...values, 1);
        const range = Math.max(1, max - min);
        const step = (spec.width - left - right) / Math.max(1, items.length - 1);
        const points = items.map((item, index) => ({
          x: left + index * step,
          y: bottom - ((valueOf(item) ?? 0) - min) / range * (bottom - top),
        }));
        const d = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
        return (
          <g>
            <line x1={left} x2={spec.width - right} y1={bottom} y2={bottom} stroke={text} strokeOpacity="0.22" />
            <path d={d} fill="none" stroke={palette[0]} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
            {points.map((point, index) => (
              <g key={`line-${index}`}>
                <circle cx={point.x} cy={point.y} r="7" fill={palette[index % palette.length]} stroke={getVisualColors(style, data).background} strokeWidth="3" />
                <text x={point.x} y={point.y - 16} textAnchor="middle" fill={text} fontSize="11" fontWeight="800">{valueLabel(items[index], values[index])}</text>
                <text x={point.x} y={bottom + 24} textAnchor="middle" fill={text} fontSize="10" opacity="0.68">{shortLines(items[index].title, 13, 1)[0]}</text>
              </g>
            ))}
          </g>
        );
      }}
    </Frame>
  );
}

function ChartDonut({ data, style }: Omit<Props, "kind">) {
  const items = data.items.filter((item) => (valueOf(item) ?? 0) > 0);
  return (
    <Frame data={data} style={style} label="Donut">
      {(spec, text, palette) => {
        const cx = spec.width * 0.38;
        const cy = spec.height * 0.59;
        const r = Math.min(spec.width, spec.height) * 0.19;
        const circumference = Math.PI * 2 * r;
        const total = Math.max(1, items.reduce((sum, item) => sum + (valueOf(item) ?? 0), 0));
        let offset = 0;
        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={text} strokeOpacity="0.08" strokeWidth="58" />
            {items.map((item, index) => {
              const share = (valueOf(item) ?? 0) / total;
              const length = share * circumference;
              const node = <circle key={`donut-${index}`} cx={cx} cy={cy} r={r} fill="none" stroke={palette[index % palette.length]} strokeWidth="58" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`} />;
              offset += length;
              return node;
            })}
            <text x={cx} y={cy - 3} textAnchor="middle" fill={text} fontSize="13" fontWeight="700">TOTAL</text>
            <text x={cx} y={cy + 27} textAnchor="middle" fill={text} fontSize="25" fontWeight="850">{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(total)}</text>
            {items.map((item, index) => {
              const x = spec.width * 0.66;
              const y = spec.height * 0.38 + index * 54;
              return (
                <g key={`legend-${index}`}>
                  <circle cx={x} cy={y} r="6" fill={palette[index % palette.length]} />
                  <text x={x + 18} y={y + 4} fill={text} fontSize="12" fontWeight="720">{shortLines(item.title, 25, 1)[0]}</text>
                  <text x={spec.width - 54} y={y + 4} textAnchor="end" fill={text} fontSize="12" fontWeight="820">{valueLabel(item, valueOf(item))}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

function ChartWaterfall({ data, style }: Omit<Props, "kind">) {
  const items = data.items.filter((item) => valueOf(item) !== null);
  const cumulative: number[] = [];
  let running = 0;
  items.forEach((item) => {
    running += valueOf(item) ?? 0;
    cumulative.push(running);
  });
  return (
    <Frame data={data} style={style} label="Waterfall chiffré">
      {(spec, text, palette) => {
        const left = 70;
        const right = 52;
        const top = spec.height * 0.27;
        const bottom = spec.height - 92;
        const maxAbs = Math.max(1, ...cumulative.map(Math.abs));
        const baseline = bottom - (bottom - top) * 0.16;
        const scale = (bottom - top) * 0.75 / maxAbs;
        const slot = (spec.width - left - right) / Math.max(1, items.length);
        let previous = 0;
        return (
          <g>
            <line x1={left} x2={spec.width - right} y1={baseline} y2={baseline} stroke={text} strokeOpacity="0.2" />
            {items.map((item, index) => {
              const delta = valueOf(item) ?? 0;
              const next = previous + delta;
              const startY = baseline - previous * scale;
              const endY = baseline - next * scale;
              const y = Math.min(startY, endY);
              const h = Math.max(5, Math.abs(endY - startY));
              const width = slot * 0.58;
              const x = left + index * slot + (slot - width) / 2;
              const color = delta >= 0 ? palette[0] : palette[Math.min(2, palette.length - 1)];
              const prior = previous;
              previous = next;
              return (
                <g key={`waterfall-${index}`}>
                  {index > 0 && <line x1={x - slot * 0.21} x2={x} y1={baseline - prior * scale} y2={baseline - prior * scale} stroke={text} strokeOpacity="0.22" strokeDasharray="4 4" />}
                  <rect x={x} y={y} width={width} height={h} rx="6" fill={color} opacity="0.82" />
                  <text x={x + width / 2} y={y - 10} textAnchor="middle" fill={text} fontSize="11" fontWeight="800">{valueLabel(item, delta)}</text>
                  <text x={x + width / 2} y={bottom + 24} textAnchor="middle" fill={text} fontSize="10" opacity="0.68">{shortLines(item.title, 13, 1)[0]}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Frame>
  );
}

export function CustomVisual({ kind, data, style }: Props) {
  if (kind === "iceberg") return <Iceberg data={data} style={style} />;
  if (kind === "cycle") return <Cycle data={data} style={style} />;
  if (kind === "sankey") return <Sankey data={data} style={style} />;
  if (kind === "matrix") return <MatrixPreset kind="matrix" data={data} style={style} />;
  if (kind === "swot") return <MatrixPreset kind="swot" data={data} style={style} />;
  if (kind === "impact") return <MatrixPreset kind="impact" data={data} style={style} />;
  if (kind === "eisenhower") return <MatrixPreset kind="eisenhower" data={data} style={style} />;
  if (kind === "risk") return <MatrixPreset kind="risk" data={data} style={style} />;
  if (kind === "architecture") return <Architecture data={data} style={style} />;
  if (kind === "hub") return <Hub data={data} style={style} />;
  if (kind === "table") return <TableVisual data={data} style={style} />;
  if (kind === "kpi") return <KPI data={data} style={style} />;
  if (kind === "venn") return <Venn data={data} style={style} />;
  if (kind === "tree") return <Tree data={data} style={style} />;
  if (kind === "chart-bar") return <ChartBar data={data} style={style} />;
  if (kind === "chart-column") return <ChartColumn data={data} style={style} />;
  if (kind === "chart-line") return <ChartLine data={data} style={style} />;
  if (kind === "chart-donut") return <ChartDonut data={data} style={style} />;
  return <ChartWaterfall data={data} style={style} />;
}
