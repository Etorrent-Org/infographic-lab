import { getVisualColors } from "./antv";
import type {
  CanonicalInfographic,
  CustomVisualKind,
  InfographicItem,
  InfographicStyle,
} from "./types";

type Props = {
  kind: CustomVisualKind;
  data: CanonicalInfographic;
  style: InfographicStyle;
};

const WIDTH = 1120;
const HEIGHT = 680;

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

function itemText(
  item: InfographicItem,
  x: number,
  y: number,
  color: string,
  align: "start" | "middle" | "end" = "start",
  width = 260,
) {
  const title = shortLines(item.title, 25, 2);
  const desc = shortLines(item.description, Math.max(28, Math.round(width / 8)), 3);
  return (
    <g>
      <text x={x} y={y} fill={color} fontSize="18" fontWeight="700" textAnchor={align}>
        {title.map((line, index) => (
          <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 21}>{line}</tspan>
        ))}
      </text>
      <text x={x} y={y + 31 + Math.max(0, title.length - 1) * 21} fill={color} fontSize="13" opacity="0.82" textAnchor={align}>
        {desc.map((line, index) => (
          <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 18}>{line}</tspan>
        ))}
      </text>
    </g>
  );
}

function Header({ data, color }: { data: CanonicalInfographic; color: string }) {
  return (
    <g>
      <text x={WIDTH / 2} y="58" textAnchor="middle" fill={color} fontSize="34" fontWeight="750">
        {data.title}
      </text>
      {data.subtitle && (
        <text x={WIDTH / 2} y="88" textAnchor="middle" fill={color} fontSize="16" opacity="0.72">
          {data.subtitle}
        </text>
      )}
    </g>
  );
}

function Iceberg({ data, style }: Omit<Props, "kind">) {
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#27313A";
  const water = style === "chalk" ? "#9AB8D0" : "#67A7C8";
  const visibleCount = Math.max(1, Math.min(2, Math.ceil(data.items.length * 0.34)));
  const visible = data.items.slice(0, visibleCount);
  const hidden = data.items.slice(visibleCount);
  const rough = style === "chalk" || style === "sketch";

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Iceberg : ${data.title}`}>
      <defs>
        <linearGradient id="iceTop" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#F8FCFF" />
          <stop offset="100%" stopColor="#C9E2EC" />
        </linearGradient>
        <linearGradient id="iceBottom" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9CCADB" />
          <stop offset="100%" stopColor="#5C87A4" />
        </linearGradient>
        <filter id="roughen" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={rough ? 2.2 : 0} />
        </filter>
      </defs>
      <rect width={WIDTH} height={HEIGHT} rx="26" fill={colors.background} />
      <Header data={data} color={text} />
      <g filter={rough ? "url(#roughen)" : undefined}>
        <path d="M 457 272 L 515 147 L 557 116 L 607 159 L 664 272 Z" fill="url(#iceTop)" stroke={colors.accent} strokeWidth="3" />
        <path d="M 360 292 L 760 292 L 713 570 L 640 623 L 527 605 L 436 625 L 389 545 Z" fill="url(#iceBottom)" stroke={colors.accent} strokeWidth="3" />
      </g>
      <line x1="90" x2="1030" y1="282" y2="282" stroke={water} strokeWidth="5" strokeDasharray={rough ? "18 12" : undefined} />
      <text x="105" y="266" fill={text} fontSize="12" fontWeight="700" opacity="0.7">VISIBLE</text>
      <text x="105" y="309" fill={text} fontSize="12" fontWeight="700" opacity="0.7">SOUS LA SURFACE</text>

      {visible.map((item, index) => {
        const y = 150 + index * 82;
        return (
          <g key={`visible-${index}`}>
            <line x1="455" y1={y + 12} x2="326" y2={y + 12} stroke={colors.palette[index % colors.palette.length]} strokeWidth="2" />
            <circle cx="455" cy={y + 12} r="5" fill={colors.palette[index % colors.palette.length]} />
            {itemText(item, 305, y, text, "end", 280)}
          </g>
        );
      })}

      {hidden.map((item, index) => {
        const side = index % 2 === 0 ? "left" : "right";
        const row = Math.floor(index / 2);
        const y = 360 + row * 112;
        const anchorX = side === "left" ? 405 : 715;
        const textX = side === "left" ? 310 : 810;
        const align = side === "left" ? "end" : "start";
        return (
          <g key={`hidden-${index}`}>
            <line x1={anchorX} y1={y} x2={side === "left" ? 330 : 790} y2={y} stroke={colors.palette[(index + visibleCount) % colors.palette.length]} strokeWidth="2" />
            <circle cx={anchorX} cy={y} r="5" fill={colors.palette[(index + visibleCount) % colors.palette.length]} />
            {itemText(item, textX, y - 8, text, align, 270)}
          </g>
        );
      })}
    </svg>
  );
}

function Cycle({ data, style }: Omit<Props, "kind">) {
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#27313A";
  const centerX = WIDTH / 2;
  const centerY = 390;
  const radius = 205;
  const count = data.items.length;
  const rough = style === "chalk" || style === "sketch";

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Cycle : ${data.title}`}>
      <defs>
        <marker id="cycleArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill={colors.accent} />
        </marker>
      </defs>
      <rect width={WIDTH} height={HEIGHT} rx="26" fill={colors.background} />
      <Header data={data} color={text} />
      <circle cx={centerX} cy={centerY} r="112" fill="none" stroke={colors.accent} strokeOpacity="0.16" strokeWidth="28" strokeDasharray={rough ? "22 16" : undefined} />
      <text x={centerX} y={centerY - 4} textAnchor="middle" fill={text} fontSize="18" fontWeight="700">BOUCLE</text>
      <text x={centerX} y={centerY + 23} textAnchor="middle" fill={text} fontSize="13" opacity="0.68">amélioration continue</text>
      {data.items.map((item, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
        const nextAngle = -Math.PI / 2 + (((index + 1) % count) * Math.PI * 2) / count;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const nx = centerX + Math.cos(nextAngle) * radius;
        const ny = centerY + Math.sin(nextAngle) * radius;
        const color = colors.palette[index % colors.palette.length];
        return (
          <g key={`cycle-${index}`}>
            <line x1={x} y1={y} x2={nx} y2={ny} stroke={colors.accent} strokeOpacity="0.4" strokeWidth="3" markerEnd="url(#cycleArrow)" />
            <circle cx={x} cy={y} r="58" fill={colors.background} stroke={color} strokeWidth={rough ? 4 : 3} strokeDasharray={rough ? "10 5" : undefined} />
            <text x={x} y={y - 8} textAnchor="middle" fill={text} fontSize="16" fontWeight="750">{shortLines(item.title, 16, 2).map((line, li) => <tspan key={line} x={x} dy={li ? 18 : 0}>{line}</tspan>)}</text>
            <text x={x} y={y + 33} textAnchor="middle" fill={text} fontSize="11" opacity="0.72">{String(index + 1).padStart(2, "0")}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Sankey({ data, style }: Omit<Props, "kind">) {
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#27313A";
  const count = data.items.length;
  const startX = 125;
  const endX = 995;
  const step = count > 1 ? (endX - startX) / (count - 1) : 0;
  const rough = style === "chalk" || style === "sketch";

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Sankey simple : ${data.title}`}>
      <rect width={WIDTH} height={HEIGHT} rx="26" fill={colors.background} />
      <Header data={data} color={text} />
      <text x="90" y="128" fill={text} fontSize="12" fontWeight="700" opacity="0.65">FLUX NARRATIF · NON QUANTITATIF</text>
      {data.items.slice(0, -1).map((_, index) => {
        const x1 = startX + index * step;
        const x2 = startX + (index + 1) * step;
        const y1 = 340 + Math.sin(index * 1.3) * 85;
        const y2 = 340 + Math.sin((index + 1) * 1.3) * 85;
        const mid = (x1 + x2) / 2;
        return (
          <path
            key={`flow-${index}`}
            d={`M ${x1 + 34} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2 - 34} ${y2}`}
            fill="none"
            stroke={colors.palette[index % colors.palette.length]}
            strokeOpacity="0.34"
            strokeWidth={rough ? 28 : 34}
            strokeLinecap="round"
            strokeDasharray={rough ? "34 12" : undefined}
          />
        );
      })}
      {data.items.map((item, index) => {
        const x = startX + index * step;
        const y = 340 + Math.sin(index * 1.3) * 85;
        const cardY = index % 2 === 0 ? y - 150 : y + 72;
        const color = colors.palette[index % colors.palette.length];
        return (
          <g key={`node-${index}`}>
            <circle cx={x} cy={y} r="38" fill={color} stroke={colors.background} strokeWidth="7" />
            <text x={x} y={y + 6} textAnchor="middle" fill={colors.dark ? "#111827" : "#FFFFFF"} fontSize="15" fontWeight="800">{String(index + 1).padStart(2, "0")}</text>
            <line x1={x} x2={x} y1={index % 2 === 0 ? y - 38 : y + 38} y2={index % 2 === 0 ? cardY + 46 : cardY - 12} stroke={color} strokeWidth="2" />
            {itemText(item, x, cardY, text, "middle", 180)}
          </g>
        );
      })}
    </svg>
  );
}

function Matrix({ data, style }: Omit<Props, "kind">) {
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#27313A";
  const items = data.items.slice(0, 4);
  const startX = 80;
  const startY = 142;
  const gap = 18;
  const gridW = WIDTH - 160;
  const gridH = HEIGHT - 202;
  const cellW = (gridW - gap) / 2;
  const cellH = (gridH - gap) / 2;

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Matrice de synthèse : ${data.title}`}>
      <rect width={WIDTH} height={HEIGHT} rx="26" fill={colors.background} />
      <Header data={data} color={text} />
      <text x={startX} y="122" fill={text} fontSize="11" fontWeight="800" opacity="0.58" letterSpacing="1.7">MATRICE DE SYNTHÈSE · 4 AXES</text>
      {items.map((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = startX + col * (cellW + gap);
        const y = startY + row * (cellH + gap);
        const color = colors.palette[index % colors.palette.length];
        const titleLines = shortLines(item.title, 28, 2);
        const descLines = shortLines(item.description, 48, 4);
        return (
          <g key={`matrix-${index}`}>
            <rect x={x} y={y} width={cellW} height={cellH} rx="24" fill={color} opacity={colors.dark ? 0.2 : 0.1} stroke={color} strokeOpacity="0.46" strokeWidth="2" />
            <rect x={x} y={y} width="9" height={cellH} rx="4.5" fill={color} />
            <text x={x + 34} y={y + 42} fill={color} fontSize="12" fontWeight="850" letterSpacing="1.4">{String(index + 1).padStart(2, "0")}</text>
            <text x={x + 34} y={y + 80} fill={text} fontSize="22" fontWeight="760">
              {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={x + 34} dy={lineIndex ? 26 : 0}>{line}</tspan>)}
            </text>
            <text x={x + 34} y={y + 136 + Math.max(0, titleLines.length - 1) * 26} fill={text} fontSize="13" opacity="0.78">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={x + 34} dy={lineIndex ? 19 : 0}>{line}</tspan>)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Architecture({ data, style }: Omit<Props, "kind">) {
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#27313A";
  const items = data.items.slice(0, 6);
  const startX = 115;
  const startY = 138;
  const width = 890;
  const gap = 10;
  const available = 490;
  const layerH = Math.min(94, (available - gap * Math.max(0, items.length - 1)) / Math.max(1, items.length));

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Architecture : ${data.title}`}>
      <rect width={WIDTH} height={HEIGHT} rx="26" fill={colors.background} />
      <Header data={data} color={text} />
      <text x="78" y="390" fill={text} fontSize="11" fontWeight="850" opacity="0.48" letterSpacing="2" transform="rotate(-90 78 390)">ARCHITECTURE · COUCHES</text>
      {items.map((item, index) => {
        const y = startY + index * (layerH + gap);
        const color = colors.palette[index % colors.palette.length];
        const titleLines = shortLines(item.title, 30, 2);
        const descLines = shortLines(item.description, 72, 2);
        return (
          <g key={`architecture-${index}`}>
            <rect x={startX} y={y} width={width} height={layerH} rx="18" fill={color} opacity={colors.dark ? 0.2 : 0.09} stroke={color} strokeOpacity="0.42" />
            <rect x={startX} y={y} width="74" height={layerH} rx="18" fill={color} opacity="0.96" />
            <text x={startX + 37} y={y + layerH / 2 + 7} textAnchor="middle" fill={colors.dark ? "#111827" : "#FFFFFF"} fontSize="18" fontWeight="850">{String(index + 1).padStart(2, "0")}</text>
            <text x={startX + 102} y={y + 31} fill={text} fontSize="18" fontWeight="760">
              {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={startX + 102} dy={lineIndex ? 21 : 0}>{line}</tspan>)}
            </text>
            <text x={startX + 405} y={y + 31} fill={text} fontSize="12.5" opacity="0.76">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={startX + 405} dy={lineIndex ? 18 : 0}>{line}</tspan>)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Hub({ data, style }: Omit<Props, "kind">) {
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#27313A";
  const items = data.items.slice(0, 6);
  const centerX = WIDTH / 2;
  const centerY = 386;
  const radiusX = 360;
  const radiusY = 205;
  const cardW = 205;
  const cardH = 112;

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Carte radiale : ${data.title}`}>
      <rect width={WIDTH} height={HEIGHT} rx="26" fill={colors.background} />
      <Header data={data} color={text} />
      <circle cx={centerX} cy={centerY} r="104" fill={colors.accent} opacity={colors.dark ? 0.28 : 0.14} stroke={colors.accent} strokeWidth="3" />
      <circle cx={centerX} cy={centerY} r="78" fill={colors.background} stroke={colors.accent} strokeOpacity="0.5" strokeWidth="2" />
      <text x={centerX} y={centerY - 8} textAnchor="middle" fill={text} fontSize="16" fontWeight="850" letterSpacing="1.2">CARTE</text>
      <text x={centerX} y={centerY + 17} textAnchor="middle" fill={text} fontSize="13" opacity="0.68">des idées clés</text>
      {items.map((item, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / items.length;
        const anchorX = centerX + Math.cos(angle) * radiusX;
        const anchorY = centerY + Math.sin(angle) * radiusY;
        const x = Math.max(34, Math.min(WIDTH - cardW - 34, anchorX - cardW / 2));
        const y = Math.max(122, Math.min(HEIGHT - cardH - 34, anchorY - cardH / 2));
        const cx = x + cardW / 2;
        const cy = y + cardH / 2;
        const color = colors.palette[index % colors.palette.length];
        const titleLines = shortLines(item.title, 24, 2);
        const descLines = shortLines(item.description, 30, 3);
        return (
          <g key={`hub-${index}`}>
            <line x1={centerX} y1={centerY} x2={cx} y2={cy} stroke={color} strokeWidth="3" strokeOpacity="0.34" />
            <circle cx={cx} cy={cy} r="8" fill={color} />
            <rect x={x} y={y} width={cardW} height={cardH} rx="18" fill={colors.background} stroke={color} strokeWidth="2" />
            <rect x={x} y={y} width="7" height={cardH} rx="3.5" fill={color} />
            <text x={x + 20} y={y + 29} fill={text} fontSize="15" fontWeight="760">
              {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={x + 20} dy={lineIndex ? 18 : 0}>{line}</tspan>)}
            </text>
            <text x={x + 20} y={y + 69 + Math.max(0, titleLines.length - 1) * 18} fill={text} fontSize="11" opacity="0.72">
              {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={x + 20} dy={lineIndex ? 15 : 0}>{line}</tspan>)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CustomVisual({ kind, data, style }: Props) {
  if (kind === "iceberg") return <Iceberg data={data} style={style} />;
  if (kind === "cycle") return <Cycle data={data} style={style} />;
  if (kind === "matrix") return <Matrix data={data} style={style} />;
  if (kind === "architecture") return <Architecture data={data} style={style} />;
  if (kind === "hub") return <Hub data={data} style={style} />;
  return <Sankey data={data} style={style} />;
}
