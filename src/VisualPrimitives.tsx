import type { ReactNode } from "react";
import { getVisualColors } from "./antv";
import { auditVisualPlan, charsForWidth, cleanVisualText, structuralScore, wrapVisualText } from "./visual-layout";
import type { LayoutBox, VisualLayoutPlan } from "./visual-layout";
import type { CanonicalInfographic, InfographicStyle } from "./types";

export type VisualTheme = {
  background: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  accent: string;
  palette: string[];
  dark: boolean;
};

function supportingPalette(style: InfographicStyle, accent: string, dark: boolean) {
  if (style === "soft") return [accent, "#5F7C75", "#8A6F57", "#A56B74", "#5F7397", "#8B6B9D"];
  if (style === "sketch") return [accent, "#5F7180", "#7B6A58", "#6D7E6A", "#956E78", "#727292"];
  if (style === "chalk") return [accent, "#79CFC2", "#7AA7E8", "#E6B96C", "#C996D6", "#E18383"];
  if (dark) return [accent, "#60A5FA", "#2DD4BF", "#FBBF24", "#A78BFA", "#FB7185"];
  return [accent, "#2563EB", "#0F8A7A", "#D97706", "#7C3AED", "#DC3E54"];
}

export function visualTheme(style: InfographicStyle, data: CanonicalInfographic): VisualTheme {
  const colors = getVisualColors(style, data);
  const dark = colors.dark;
  return {
    background: colors.background,
    surface: dark ? "#151B25" : "#FFFFFF",
    surfaceStrong: dark ? "#202938" : "#F6F8FC",
    text: dark ? "#F8FAFC" : "#172033",
    muted: dark ? "#AEB8C7" : "#667085",
    accent: colors.accent,
    palette: supportingPalette(style, colors.accent, dark),
    dark,
  };
}

export function VisualFrame({
  plan,
  data,
  style,
  label,
  children,
}: {
  plan: VisualLayoutPlan;
  data: CanonicalInfographic;
  style: InfographicStyle;
  label: string;
  children: ReactNode;
}) {
  const theme = visualTheme(style, data);
  const { spec } = plan;
  const titleSize = spec.width < 900 ? 30 : 34;
  const titleChars = spec.width < 900 ? 34 : spec.width < 1100 ? 44 : 54;
  const titleLines = wrapVisualText(data.title, titleChars, 2).lines;
  const subtitleLines = data.subtitle ? wrapVisualText(data.subtitle, spec.width < 900 ? 58 : 90, 2).lines : [];
  const issues = auditVisualPlan(plan);
  const score = structuralScore(plan);

  return (
    <svg
      className={`custom-visual custom-${style}`}
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      role="img"
      aria-label={`${label} : ${cleanVisualText(data.title)}`}
      data-visual-kind={plan.kind}
      data-visual-version="5"
      data-layout-issues={issues.length}
      data-structure-score={score.toFixed(1)}
    >
      <defs>
        <linearGradient id={`frame-bg-${plan.kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.background} />
          <stop offset="100%" stopColor={theme.accent} stopOpacity={theme.dark ? "0.055" : "0.022"} />
        </linearGradient>
      </defs>
      <rect width={spec.width} height={spec.height} rx="28" fill={`url(#frame-bg-${plan.kind})`} />
      <rect x="1" y="1" width={spec.width - 2} height={spec.height - 2} rx="27" fill="none" stroke={theme.text} strokeOpacity={theme.dark ? "0.10" : "0.055"} />

      <g data-role="header">
        <rect x={spec.padding} y="38" width="6" height={Math.max(58, titleLines.length * (titleSize + 5) - 4)} rx="3" fill={theme.accent} />
        <text x={spec.padding + 24} y="62" fill={theme.text} fontSize={titleSize} fontWeight="820" letterSpacing="-0.5">
          {titleLines.map((line, index) => (
            <tspan key={`${line}-${index}`} x={spec.padding + 24} dy={index === 0 ? 0 : titleSize + 5}>{line}</tspan>
          ))}
        </text>
        {subtitleLines.length > 0 && (
          <text
            x={spec.padding + 24}
            y={48 + titleLines.length * (titleSize + 5) + 25}
            fill={theme.muted}
            fontSize="14"
            fontWeight="500"
          >
            {subtitleLines.map((line, index) => (
              <tspan key={`${line}-${index}`} x={spec.padding + 24} dy={index === 0 ? 0 : 19}>{line}</tspan>
            ))}
          </text>
        )}
        <text x={spec.width - spec.padding} y="54" textAnchor="end" fill={theme.muted} fontSize="10" fontWeight="800" letterSpacing="1.5">
          {label.toLocaleUpperCase("fr")}
        </text>
      </g>

      {children}
    </svg>
  );
}

export function CardSurface({
  box,
  theme,
  accent,
  opacity = 0.1,
  radius = 18,
}: {
  box: LayoutBox;
  theme: VisualTheme;
  accent?: string;
  opacity?: number;
  radius?: number;
}) {
  const color = accent ?? theme.accent;
  return (
    <>
      <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={radius} fill={theme.surface} fillOpacity={theme.dark ? 0.76 : 0.94} />
      <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={radius} fill={color} opacity={opacity} />
      <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={radius} fill="none" stroke={color} strokeOpacity={theme.dark ? 0.38 : 0.24} strokeWidth="1.5" />
    </>
  );
}

export function TextBlock({
  box,
  title,
  description,
  theme,
  accent,
  titleSize = 16,
  descriptionSize = 11.5,
  titleMaxLines = 2,
  descriptionMaxLines = 2,
  align = "start",
  inset = 18,
}: {
  box: LayoutBox;
  title: string;
  description?: string;
  theme: VisualTheme;
  accent?: string;
  titleSize?: number;
  descriptionSize?: number;
  titleMaxLines?: number;
  descriptionMaxLines?: number;
  align?: "start" | "middle" | "end";
  inset?: number;
}) {
  const usableWidth = Math.max(60, box.width - inset * 2);
  const titleChars = charsForWidth(usableWidth, titleSize, 0.57);
  const descChars = charsForWidth(usableWidth, descriptionSize, 0.54);
  const titleLines = wrapVisualText(title, titleChars, titleMaxLines).lines;
  const descLines = description ? wrapVisualText(description, descChars, descriptionMaxLines).lines : [];
  const anchorX = align === "start" ? box.x + inset : align === "end" ? box.x + box.width - inset : box.x + box.width / 2;
  const titleLineHeight = titleSize + 4;
  const descLineHeight = descriptionSize + 4;
  const titleY = box.y + Math.max(24, inset + titleSize - 3);
  const descY = titleY + Math.max(titleLineHeight + 9, titleLines.length * titleLineHeight + 8);

  return (
    <g>
      <title>{`${cleanVisualText(title)}${description ? ` — ${cleanVisualText(description)}` : ""}`}</title>
      <text x={anchorX} y={titleY} textAnchor={align} fill={accent ?? theme.text} fontSize={titleSize} fontWeight="800">
        {titleLines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={anchorX} dy={index === 0 ? 0 : titleLineHeight}>{line}</tspan>
        ))}
      </text>
      {descLines.length > 0 && (
        <text x={anchorX} y={descY} textAnchor={align} fill={theme.muted} fontSize={descriptionSize} fontWeight="520">
          {descLines.map((line, index) => (
            <tspan key={`${line}-${index}`} x={anchorX} dy={index === 0 ? 0 : descLineHeight}>{line}</tspan>
          ))}
        </text>
      )}
    </g>
  );
}

export function ItemCard({
  box,
  title,
  description,
  theme,
  accent,
  eyebrow,
  index,
  titleSize,
  descriptionSize,
  titleMaxLines,
  descriptionMaxLines,
  opacity,
}: {
  box: LayoutBox;
  title: string;
  description?: string;
  theme: VisualTheme;
  accent?: string;
  eyebrow?: string;
  index?: number;
  titleSize?: number;
  descriptionSize?: number;
  titleMaxLines?: number;
  descriptionMaxLines?: number;
  opacity?: number;
}) {
  const color = accent ?? theme.accent;
  const textBox = eyebrow
    ? { ...box, y: box.y + 18, height: Math.max(42, box.height - 18) }
    : box;
  return (
    <g data-box-id={box.id}>
      <CardSurface box={box} theme={theme} accent={color} opacity={opacity ?? (theme.dark ? 0.12 : 0.075)} />
      <rect x={box.x} y={box.y + 12} width="4" height={Math.max(20, box.height - 24)} rx="2" fill={color} opacity="0.88" />
      {eyebrow && (
        <text x={box.x + 18} y={box.y + 21} fill={color} fontSize="9.5" fontWeight="850" letterSpacing="1.1">
          {eyebrow}
        </text>
      )}
      {index !== undefined && (
        <text x={box.x + box.width - 16} y={box.y + 21} textAnchor="end" fill={color} fontSize="10" fontWeight="850" opacity="0.75">
          {String(index + 1).padStart(2, "0")}
        </text>
      )}
      <TextBlock
        box={textBox}
        title={title}
        description={description}
        theme={theme}
        titleSize={titleSize}
        descriptionSize={descriptionSize}
        titleMaxLines={titleMaxLines}
        descriptionMaxLines={descriptionMaxLines}
      />
    </g>
  );
}

export function AnnotationBlock({
  box,
  title,
  description,
  theme,
  accent,
  eyebrow,
  index,
  titleSize = 14.5,
  descriptionSize = 10.5,
}: {
  box: LayoutBox;
  title: string;
  description?: string;
  theme: VisualTheme;
  accent?: string;
  eyebrow?: string;
  index?: number;
  titleSize?: number;
  descriptionSize?: number;
}) {
  const color = accent ?? theme.accent;
  const titleLines = wrapVisualText(title, charsForWidth(box.width - 34, titleSize, 0.56), 2).lines;
  const descLines = description ? wrapVisualText(description, charsForWidth(box.width - 34, descriptionSize, 0.53), 1).lines : [];
  const titleY = box.y + (eyebrow ? 33 : 22);
  return (
    <g data-box-id={box.id}>
      <title>{`${cleanVisualText(title)}${description ? ` — ${cleanVisualText(description)}` : ""}`}</title>
      <rect x={box.x} y={box.y + 7} width="4" height={Math.max(28, box.height - 14)} rx="2" fill={color} />
      {eyebrow && <text x={box.x + 16} y={box.y + 14} fill={color} fontSize="9" fontWeight="850" letterSpacing="1.05">{eyebrow}</text>}
      {index !== undefined && <text x={box.x + box.width - 2} y={box.y + 14} textAnchor="end" fill={color} fontSize="9.5" fontWeight="850">{String(index + 1).padStart(2, "0")}</text>}
      <text x={box.x + 16} y={titleY} fill={theme.text} fontSize={titleSize} fontWeight="820">
        {titleLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 16} dy={lineIndex === 0 ? 0 : titleSize + 4}>{line}</tspan>)}
      </text>
      {descLines.length > 0 && (
        <text x={box.x + 16} y={titleY + titleLines.length * (titleSize + 4) + 6} fill={theme.muted} fontSize={descriptionSize} fontWeight="520">
          {descLines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={box.x + 16} dy={lineIndex === 0 ? 0 : descriptionSize + 4}>{line}</tspan>)}
        </text>
      )}
    </g>
  );
}

export function SectionLabel({ x, y, label, theme, accent }: { x: number; y: number; label: string; theme: VisualTheme; accent?: string }) {
  const color = accent ?? theme.accent;
  return (
    <g>
      <rect x={x} y={y - 8} width="18" height="3" rx="1.5" fill={color} />
      <text x={x + 28} y={y - 4} fill={theme.muted} fontSize="9.5" fontWeight="850" letterSpacing="1.2">{label}</text>
    </g>
  );
}

export function ValueText({
  x,
  y,
  value,
  theme,
  accent,
  anchor = "start",
  size = 30,
}: {
  x: number;
  y: number;
  value: string;
  theme: VisualTheme;
  accent?: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
}) {
  return <text x={x} y={y} textAnchor={anchor} fill={accent ?? theme.accent} fontSize={size} fontWeight="880" letterSpacing="-0.6">{value}</text>;
}
