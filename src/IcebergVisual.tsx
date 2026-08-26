import { getVisualColors } from "./antv";
import type { CanonicalInfographic, InfographicItem, InfographicStyle } from "./types";

type Props = {
  data: CanonicalInfographic;
  style: InfographicStyle;
};

type CanvasSpec = {
  width: number;
  height: number;
};

type DepthRow = {
  title: string;
  detail: string;
};

function canvasSpec(data: CanonicalInfographic): CanvasSpec {
  const orientation = data.appearance?.orientation ?? "auto";
  if (orientation === "portrait") return { width: 820, height: 1120 };
  if (orientation === "square") return { width: 900, height: 900 };
  return { width: 1120, height: 680 };
}

function cleanText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([:;,.!?])/g, "$1")
    .replace(/[:;,\-]?\s*\.{2,}\s*$/g, "")
    .trim();
}

function wrapLines(value: string, maxChars: number, maxLines: number) {
  const text = cleanText(value);
  const words = text.split(/\s+/).filter(Boolean);
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
  return lines;
}

function isObjective(item: InfographicItem) {
  const value = `${item.title} ${item.description}`.toLocaleLowerCase("fr");
  return /\b(objectif|finalit[eé]|but|cible|r[eé]sultat attendu|solution souhait[eé]e)\b/.test(value);
}

function isVisibleSignal(item: InfographicItem) {
  const value = `${item.title} ${item.description}`.toLocaleLowerCase("fr");
  return /\b(visible|signe|sympt[oô]me|constat|probl[eè]me|impact observable|signal)\b/.test(value);
}

function splitMeaningfulParts(value: string) {
  return cleanText(value)
    .split(/\s*(?:;|\.|,|\bet\b)\s*/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 12)
    .slice(0, 5);
}

function buildDepthRows(items: InfographicItem[]): DepthRow[] {
  if (items.length >= 3) {
    return items.slice(0, 5).map((item) => ({
      title: cleanText(item.title),
      detail: cleanText(item.description),
    }));
  }

  const expanded: DepthRow[] = [];
  for (const item of items) {
    const parts = splitMeaningfulParts(item.description);
    if (parts.length >= 2) {
      parts.forEach((part, index) => {
        expanded.push({
          title: index === 0 ? cleanText(item.title) : `Niveau ${index + 1}`,
          detail: part,
        });
      });
    } else {
      expanded.push({
        title: cleanText(item.title),
        detail: cleanText(item.description),
      });
    }
  }

  return expanded.slice(0, 5);
}

function VisibleCard({
  item,
  x,
  y,
  width,
  align,
  text,
  accent,
}: {
  item: InfographicItem;
  x: number;
  y: number;
  width: number;
  align: "start" | "end";
  text: string;
  accent: string;
}) {
  const titleLines = wrapLines(item.title, Math.max(18, Math.round(width / 8.8)), 2);
  const detailLines = wrapLines(item.description, Math.max(24, Math.round(width / 7.5)), 3);
  const edge = align === "start" ? x : x - width;
  const textX = align === "start" ? edge + 18 : edge + width - 18;

  return (
    <g>
      <rect x={edge} y={y} width={width} height="102" rx="18" fill={accent} opacity="0.08" />
      <rect x={align === "start" ? edge : edge + width - 5} y={y + 16} width="5" height="70" rx="2.5" fill={accent} />
      <text x={textX} y={y + 30} textAnchor={align} fill={text} fontSize="15" fontWeight="800">
        {titleLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={textX} dy={index === 0 ? 0 : 18}>{line}</tspan>
        ))}
      </text>
      <text x={textX} y={y + 64} textAnchor={align} fill={text} fontSize="11.5" opacity="0.7">
        {detailLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={textX} dy={index === 0 ? 0 : 15}>{line}</tspan>
        ))}
      </text>
    </g>
  );
}

export function IcebergVisual({ data, style }: Props) {
  const spec = canvasSpec(data);
  const colors = getVisualColors(style, data);
  const text = colors.dark ? "#F8FAFC" : "#172033";
  const muted = colors.dark ? "#CBD5E1" : "#5F6B7A";
  const accent = colors.accent;
  const cx = spec.width / 2;
  const portrait = spec.width < 900;
  const waterY = portrait ? spec.height * 0.35 : spec.height * 0.40;
  const goalSpace = data.items.some(isObjective) ? (portrait ? 92 : 70) : 28;
  const bottomY = spec.height - goalSpace - 34;
  const topY = portrait ? spec.height * 0.19 : spec.height * 0.22;

  const objective = data.items.find(isObjective);
  const candidates = data.items.filter((item) => item !== objective);
  const explicitVisible = candidates.filter(isVisibleSignal);
  const visibleItems = (explicitVisible.length ? explicitVisible : candidates).slice(0, 2);
  const visibleSet = new Set(visibleItems);
  const deepItems = candidates.filter((item) => !visibleSet.has(item));
  const depthRows = buildDepthRows(deepItems.length ? deepItems : candidates.slice(2));
  const safeDepthRows = depthRows.length ? depthRows : [{ title: "Sous la surface", detail: "Causes et mécanismes à préciser." }];

  const shapeTopWidth = portrait ? spec.width * 0.64 : spec.width * 0.48;
  const shapeMidWidth = portrait ? spec.width * 0.46 : spec.width * 0.34;
  const shapeBottomWidth = portrait ? spec.width * 0.22 : spec.width * 0.20;
  const depthStart = waterY + 42;
  const depthEnd = bottomY - 18;
  const rowHeight = (depthEnd - depthStart) / Math.max(1, safeDepthRows.length);

  const clipId = "iceberg-depth-clip";
  const surfaceCardWidth = portrait ? 260 : 300;
  const leftCardX = portrait ? 36 : 68;
  const rightCardX = spec.width - (portrait ? 36 : 68);
  const cardY = Math.max(142, waterY - 136);

  return (
    <svg className={`custom-visual custom-${style}`} viewBox={`0 0 ${spec.width} ${spec.height}`} role="img" aria-label={`Iceberg : ${cleanText(data.title)}`}>
      <defs>
        <linearGradient id="iceberg-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={colors.background} />
          <stop offset="100%" stopColor={accent} stopOpacity="0.035" />
        </linearGradient>
        <linearGradient id="iceberg-sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.08" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="iceberg-tip" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="iceberg-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.46" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.78" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={`M ${cx - shapeTopWidth / 2} ${waterY + 10} L ${cx + shapeTopWidth / 2} ${waterY + 10} L ${cx + shapeMidWidth / 2} ${bottomY - 46} L ${cx + shapeBottomWidth / 2} ${bottomY - 6} L ${cx} ${bottomY + 12} L ${cx - shapeBottomWidth / 2} ${bottomY - 6} L ${cx - shapeMidWidth / 2} ${bottomY - 46} Z`} />
        </clipPath>
      </defs>

      <rect width={spec.width} height={waterY} rx="26" fill="url(#iceberg-sky)" />
      <path d={`M 0 ${waterY} H ${spec.width} V ${spec.height} H 0 Z`} fill="url(#iceberg-sea)" />

      <g>
        <rect x="54" y="34" width="6" height="62" rx="3" fill={accent} />
        <text x="78" y="60" fill={text} fontSize={portrait ? 28 : 34} fontWeight="800">
          {wrapLines(data.title, portrait ? 34 : 52, 2).map((line, index) => (
            <tspan key={`${line}-${index}`} x="78" dy={index === 0 ? 0 : portrait ? 34 : 40}>{line}</tspan>
          ))}
        </text>
        {data.subtitle && (
          <text x="78" y={portrait ? 132 : 124} fill={muted} fontSize="14">
            {wrapLines(data.subtitle, portrait ? 58 : 92, 2).map((line, index) => (
              <tspan key={`${line}-${index}`} x="78" dy={index === 0 ? 0 : 19}>{line}</tspan>
            ))}
          </text>
        )}
      </g>

      <text x="58" y={waterY - 12} fill={text} fontSize="11" fontWeight="800" opacity="0.58" letterSpacing="1.2">CE QUI SE VOIT</text>
      <text x="58" y={waterY + 30} fill={text} fontSize="11" fontWeight="800" opacity="0.58" letterSpacing="1.2">CE QUI SE JOUE SOUS LA SURFACE</text>

      <path d={`M ${cx - 94} ${waterY - 8} L ${cx - 42} ${topY + 12} L ${cx - 4} ${topY - 18} L ${cx + 24} ${topY - 4} L ${cx + 92} ${waterY - 8} Z`} fill="url(#iceberg-tip)" stroke={accent} strokeWidth="3" />
      <path d={`M ${cx - shapeTopWidth / 2} ${waterY + 10} L ${cx + shapeTopWidth / 2} ${waterY + 10} L ${cx + shapeMidWidth / 2} ${bottomY - 46} L ${cx + shapeBottomWidth / 2} ${bottomY - 6} L ${cx} ${bottomY + 12} L ${cx - shapeBottomWidth / 2} ${bottomY - 6} L ${cx - shapeMidWidth / 2} ${bottomY - 46} Z`} fill="url(#iceberg-body)" stroke={accent} strokeWidth="3" />

      <line x1="42" x2={spec.width - 42} y1={waterY} y2={waterY} stroke={accent} strokeWidth="4" strokeOpacity="0.56" />
      <line x1="42" x2={spec.width - 42} y1={waterY + 8} y2={waterY + 8} stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.56" />

      {visibleItems[0] && (
        <VisibleCard item={visibleItems[0]} x={leftCardX} y={cardY} width={surfaceCardWidth} align="start" text={text} accent={accent} />
      )}
      {visibleItems[1] && (
        <VisibleCard item={visibleItems[1]} x={rightCardX} y={cardY} width={surfaceCardWidth} align="end" text={text} accent={accent} />
      )}

      <g clipPath={`url(#${clipId})`}>
        {safeDepthRows.map((row, index) => {
          const y = depthStart + index * rowHeight;
          const localAccent = colors.palette[index % colors.palette.length] ?? accent;
          return (
            <g key={`${row.title}-${index}`}>
              <rect x="0" y={y - 22} width={spec.width} height={rowHeight + 1} fill={index % 2 === 0 ? "#FFFFFF" : localAccent} opacity={index % 2 === 0 ? 0.08 : 0.06} />
              {index > 0 && <line x1={cx - shapeTopWidth / 2} x2={cx + shapeTopWidth / 2} y1={y - 22} y2={y - 22} stroke="#FFFFFF" strokeOpacity="0.28" />}
              <text x={cx} y={y} textAnchor="middle" fill="#FFFFFF" fontSize={portrait ? 14 : 15} fontWeight="820">
                {wrapLines(row.title, portrait ? 28 : 38, 1)[0]}
              </text>
              <text x={cx} y={y + 22} textAnchor="middle" fill="#FFFFFF" fontSize={portrait ? 10.5 : 11.5} opacity="0.86">
                {wrapLines(row.detail, portrait ? 48 : 62, 2).map((line, lineIndex) => (
                  <tspan key={`${line}-${lineIndex}`} x={cx} dy={lineIndex === 0 ? 0 : 15}>{line}</tspan>
                ))}
              </text>
            </g>
          );
        })}
      </g>

      <g>
        <text x={cx - shapeTopWidth / 2 - 34} y={depthStart} textAnchor="end" fill={text} fontSize="10" fontWeight="800" opacity="0.5">PROFONDEUR</text>
        <line x1={cx - shapeTopWidth / 2 - 18} x2={cx - shapeMidWidth / 2 - 18} y1={depthStart + 12} y2={depthEnd - 10} stroke={accent} strokeWidth="2" strokeOpacity="0.35" />
        {safeDepthRows.map((_, index) => {
          const y = depthStart + index * rowHeight + 14;
          return <circle key={`depth-${index}`} cx={cx - shapeTopWidth / 2 - 18} cy={y} r="4" fill={accent} opacity={0.38 + index * 0.1} />;
        })}
      </g>

      {objective && (
        <g>
          <rect x="54" y={spec.height - (portrait ? 82 : 62)} width={spec.width - 108} height={portrait ? 54 : 44} rx="14" fill={accent} opacity="0.11" />
          <text x="72" y={spec.height - (portrait ? 60 : 36)} fill={accent} fontSize="10" fontWeight="850" letterSpacing="1.1">CAP / OBJECTIF</text>
          <text x={portrait ? 72 : 184} y={spec.height - (portrait ? 38 : 36)} fill={text} fontSize={portrait ? 11.5 : 12.5} fontWeight="700">
            {wrapLines(objective.description || objective.title, portrait ? 70 : 92, portrait ? 2 : 1).map((line, index) => (
              <tspan key={`${line}-${index}`} x={portrait ? 72 : 184} dy={index === 0 ? 0 : 15}>{line}</tspan>
            ))}
          </text>
        </g>
      )}
    </svg>
  );
}
