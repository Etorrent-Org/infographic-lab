import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat, MarketingTemplate } from "./marketing";

export type FitText = {
  lines: string[];
  size: number;
  lineHeight: number;
  truncated: boolean;
};

export type Layout = {
  w: number;
  h: number;
  safe: number;
  landscape: boolean;
  tall: boolean;
};

export function esc(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function attr(value: string) {
  return esc(value).replace(/[\r\n]+/g, " ");
}

export function clean(value: string, max = 1200) {
  const compact = String(value ?? "").trim().replace(/\s+/g, " ");
  return compact.length > max ? compact.slice(0, max).trim() : compact;
}

function hexToRgb(value: string) {
  const raw = value.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) return null;
  const hex = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function luminance(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) return null;
  const channel = (value: number) => {
    const x = value / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la == null || lb == null) return 7;
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export function readableOn(background: string, preferred: string) {
  if (contrast(background, preferred) >= 3.8) return preferred;
  return contrast(background, "#0B1020") >= contrast(background, "#FFFFFF") ? "#0B1020" : "#FFFFFF";
}

export function fontStack(brand: BrandProfile, editorial = false) {
  if (editorial || brand.fontFamily === "serif") return "Georgia,'Times New Roman',serif";
  if (brand.fontFamily === "mono") return "'SFMono-Regular',Consolas,'Liberation Mono',monospace";
  return "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
}

function glyphFactor(char: string) {
  if (char === " ") return 0.29;
  if (/[ilI1|.,'`:;]/.test(char)) return 0.29;
  if (/[MW@#%&]/.test(char)) return 0.88;
  if (/[A-ZÀ-ÖØ-Þ]/.test(char)) return 0.66;
  if (/[0-9]/.test(char)) return 0.57;
  return 0.53;
}

function estimateWidth(text: string, size: number, weight: number) {
  const factor = weight >= 800 ? 1.035 : weight >= 650 ? 1.015 : 1;
  return Array.from(text).reduce((sum, char) => sum + glyphFactor(char), 0) * size * factor;
}

function splitLongWord(word: string, maxWidth: number, size: number, weight: number) {
  const chunks: string[] = [];
  let current = "";
  for (const char of Array.from(word)) {
    const next = current + char;
    if (current && estimateWidth(next, size, weight) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function wrapAtSize(value: string, maxWidth: number, size: number, weight: number, maxLines: number) {
  const words = clean(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let complete = true;

  const push = (line: string) => {
    if (!line) return true;
    if (lines.length >= maxLines) {
      complete = false;
      return false;
    }
    lines.push(line);
    return true;
  };

  for (const rawWord of words) {
    const pieces = estimateWidth(rawWord, size, weight) > maxWidth
      ? splitLongWord(rawWord, maxWidth, size, weight)
      : [rawWord];

    for (const word of pieces) {
      const next = current ? `${current} ${word}` : word;
      if (estimateWidth(next, size, weight) <= maxWidth) {
        current = next;
        continue;
      }
      if (!push(current)) break;
      current = word;
    }

    if (!complete) break;
  }

  if (complete && current) complete = push(current);
  return { lines, complete };
}

function ellipsize(line: string, maxWidth: number, size: number, weight: number) {
  let value = line.replace(/[.…]+$/, "").trimEnd();
  while (value.length > 1 && estimateWidth(`${value}…`, size, weight) > maxWidth) {
    value = value.slice(0, -1).trimEnd();
  }
  return `${value}…`;
}

export function fitText(
  value: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  minSize: number,
  weight: number,
  maxLines: number,
  lineRatio = 1.04,
): FitText {
  const source = clean(value);
  if (!source) return { lines: [], size: minSize, lineHeight: minSize * lineRatio, truncated: false };

  for (let size = Math.round(maxSize); size >= Math.round(minSize); size -= 2) {
    const lineHeight = size * lineRatio;
    const heightLines = Math.max(1, Math.floor((maxHeight - size * 0.08) / lineHeight));
    const allowed = Math.max(1, Math.min(maxLines, heightLines));
    const wrapped = wrapAtSize(source, maxWidth, size, weight, allowed);
    const totalHeight = wrapped.lines.length ? size + (wrapped.lines.length - 1) * lineHeight : 0;
    if (wrapped.complete && totalHeight <= maxHeight + 0.5) {
      return { lines: wrapped.lines, size, lineHeight, truncated: false };
    }
  }

  const size = Math.round(minSize);
  const lineHeight = size * lineRatio;
  const allowed = Math.max(1, Math.min(maxLines, Math.floor(maxHeight / lineHeight)));
  const wrapped = wrapAtSize(source, maxWidth, size, weight, allowed);
  const lines = wrapped.lines.length ? wrapped.lines.slice(0, allowed) : [source];
  const truncated = !wrapped.complete || estimateWidth(lines[lines.length - 1], size, weight) > maxWidth;
  if (truncated) lines[lines.length - 1] = ellipsize(lines[lines.length - 1], maxWidth, size, weight);
  return { lines, size, lineHeight, truncated };
}

export function baselineFromTop(top: number, fit: FitText) {
  return top + fit.size * 0.82;
}

export function blockBottom(baseline: number, fit: FitText) {
  if (!fit.lines.length) return baseline;
  return baseline + (fit.lines.length - 1) * fit.lineHeight + fit.size * 0.24;
}

export function textBlock(
  fit: FitText,
  x: number,
  y: number,
  fill: string,
  weight: number,
  family: string,
  anchor: "start" | "middle" | "end" = "start",
  letterSpacing = 0,
) {
  if (!fit.lines.length) return "";
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${fit.size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}" letter-spacing="${letterSpacing}">${fit.lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : fit.lineHeight}">${esc(line)}</tspan>`).join("")}</text>`;
}

export function layoutOf(format: MarketingFormat): Layout {
  const { width: w, height: h } = format;
  const ratio = w / h;
  return {
    w,
    h,
    safe: Math.round(Math.max(42, Math.min(96, Math.min(w, h) * 0.058))),
    landscape: ratio > 1.28,
    tall: ratio < 0.68,
  };
}

export function brandLockup(brand: BrandProfile, x: number, y: number, maxWidth: number, color: string) {
  if (brand.logoDataUrl) {
    const height = Math.max(34, Math.min(62, maxWidth * 0.34));
    return `<image href="${attr(brand.logoDataUrl)}" x="${x}" y="${y - height * 0.72}" width="${maxWidth}" height="${height}" preserveAspectRatio="xMinYMid meet" />`;
  }
  const fit = fitText(brand.name, maxWidth, 42, 24, 14, 820, 1, 1);
  return textBlock(fit, x, y, color, 820, fontStack(brand), "start", Math.max(0.5, fit.size * 0.045));
}

export function badge(campaign: MarketingCampaign, x: number, y: number, maxWidth: number, bg: string, fg: string) {
  if (!campaign.badge?.trim()) return "";
  const label = clean(campaign.badge, 60).toUpperCase();
  const fontSize = Math.max(13, Math.min(18, maxWidth * 0.055));
  const width = Math.min(maxWidth, Math.max(96, estimateWidth(label, fontSize, 820) + 34));
  const height = fontSize * 2.25;
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${bg}"/><text x="${x + width / 2}" y="${y + height * 0.66}" fill="${fg}" font-size="${fontSize}" font-weight="820" text-anchor="middle" font-family="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" letter-spacing="${fontSize * 0.06}">${esc(label)}</text></g>`;
}

export function pillButton(text: string, x: number, y: number, width: number, height: number, bg: string, fg: string, radius = height / 2) {
  const fit = fitText(clean(text, 80), width - 34, height * 0.62, Math.min(21, height * 0.34), 13, 850, 1, 1);
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${bg}"/><text x="${x + width / 2}" y="${y + height * 0.64}" fill="${fg}" font-size="${fit.size}" font-weight="850" text-anchor="middle" font-family="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">${esc(fit.lines[0] ?? "")}</text></g>`;
}

export function defs(brand: BrandProfile) {
  return `<defs>
    <linearGradient id="mk-wash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.accent}" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="${brand.background}" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="${brand.primary}" stop-opacity="0.12"/>
    </linearGradient>
    <radialGradient id="mk-halo" cx="50%" cy="45%" r="58%">
      <stop offset="0%" stop-color="${brand.accent}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${brand.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="mk-grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="${brand.primary}" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
    <pattern id="mk-dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.8" fill="${brand.primary}" opacity="0.11"/>
    </pattern>
    <filter id="mk-shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#0B1020" flood-opacity="0.18"/>
    </filter>
    <filter id="mk-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0B1020" flood-opacity="0.12"/>
    </filter>
    <filter id="mk-blur" x="-12%" y="-12%" width="124%" height="124%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>`;
}

function abstractArtwork(template: MarketingTemplate, brand: BrandProfile, x: number, y: number, w: number, h: number, id: string) {
  const accent = brand.accent;
  const ink = brand.primary;
  const radius = Math.max(20, Math.min(52, Math.min(w, h) * 0.08));
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;

  const compositions: Record<MarketingTemplate, string> = {
    editorial: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#mk-wash)"/>
      <rect x="${x + w * 0.1}" y="${y + h * 0.12}" width="${w * 0.52}" height="${h * 0.68}" rx="${radius}" fill="${accent}" opacity="0.16" transform="rotate(-8 ${cx} ${cy})"/>
      <rect x="${x + w * 0.34}" y="${y + h * 0.18}" width="${w * 0.5}" height="${h * 0.58}" rx="${radius}" fill="${brand.background}" opacity="0.92" filter="url(#mk-soft-shadow)" transform="rotate(7 ${cx} ${cy})"/>
      <circle cx="${x + w * 0.72}" cy="${y + h * 0.29}" r="${Math.min(w, h) * 0.13}" fill="none" stroke="${ink}" stroke-width="3" opacity="0.25"/>
      <path d="M ${x + w * 0.2} ${y + h * 0.73} Q ${x + w * 0.5} ${y + h * 0.42} ${x + w * 0.78} ${y + h * 0.7}" stroke="${ink}" stroke-width="4" fill="none" opacity="0.3" />`,
    impact: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink}"/>
      <circle cx="${x + w * 0.72}" cy="${y + h * 0.24}" r="${Math.min(w, h) * 0.24}" fill="none" stroke="${accent}" stroke-width="${Math.max(18, Math.min(w, h) * 0.055)}"/>
      <path d="M${x - w * 0.1} ${y + h * 0.82} L${x + w * 0.72} ${y + h * 0.35} L${x + w * 1.08} ${y + h * 0.48} L${x + w * 0.24} ${y + h * 0.98}Z" fill="${accent}" opacity="0.82"/>
      <rect x="${x + w * 0.12}" y="${y + h * 0.12}" width="${w * 0.34}" height="${h * 0.2}" fill="url(#mk-grid)" opacity="0.85"/>`,
    spotlight: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#mk-halo)"/>
      <ellipse cx="${cx}" cy="${y + h * 0.78}" rx="${w * 0.28}" ry="${h * 0.06}" fill="${ink}" opacity="0.12"/>
      <rect x="${x + w * 0.33}" y="${y + h * 0.19}" width="${w * 0.34}" height="${h * 0.52}" rx="${radius}" fill="${ink}" opacity="0.9" filter="url(#mk-shadow)"/>
      <rect x="${x + w * 0.39}" y="${y + h * 0.26}" width="${w * 0.22}" height="${h * 0.08}" rx="${radius * 0.35}" fill="${accent}" opacity="0.82"/>
      <circle cx="${cx}" cy="${y + h * 0.51}" r="${Math.min(w, h) * 0.09}" fill="${accent}" opacity="0.34"/>`,
    retail: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#mk-dots)"/>
      <rect x="${x + w * 0.14}" y="${y + h * 0.16}" width="${w * 0.7}" height="${h * 0.68}" rx="${radius}" fill="${brand.background}" filter="url(#mk-soft-shadow)"/>
      <rect x="${x + w * 0.22}" y="${y + h * 0.27}" width="${w * 0.56}" height="${h * 0.44}" rx="${radius * 0.7}" fill="${ink}" opacity="0.08"/>
      <circle cx="${x + w * 0.7}" cy="${y + h * 0.32}" r="${Math.min(w, h) * 0.12}" fill="${accent}" opacity="0.95"/>
      <path d="M${x + w * 0.25} ${y + h * 0.66} L${x + w * 0.48} ${y + h * 0.41} L${x + w * 0.72} ${y + h * 0.64}" fill="none" stroke="${ink}" stroke-width="4" opacity="0.23"/>`,
    zen: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${brand.background}"/>
      <circle cx="${x + w * 0.62}" cy="${y + h * 0.38}" r="${Math.min(w, h) * 0.23}" fill="${accent}" opacity="0.16"/>
      <circle cx="${x + w * 0.62}" cy="${y + h * 0.38}" r="${Math.min(w, h) * 0.14}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.18"/>
      <path d="M${x + w * 0.12} ${y + h * 0.72} C${x + w * 0.35} ${y + h * 0.58},${x + w * 0.54} ${y + h * 0.92},${x + w * 0.9} ${y + h * 0.6}" fill="none" stroke="${ink}" stroke-width="2.5" opacity="0.2"/>
      <line x1="${x + w * 0.18}" y1="${y + h * 0.2}" x2="${x + w * 0.48}" y2="${y + h * 0.2}" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`,
  };

  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><g clip-path="url(#${id})">${compositions[template]}</g>`;
}

export function mediaPanel(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, w: number, h: number, template: MarketingTemplate, id: string) {
  const radius = Math.max(20, Math.min(52, Math.min(w, h) * 0.075));
  const frame = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${brand.background}" stroke="${brand.primary}" stroke-opacity="0.08" filter="url(#mk-soft-shadow)"/>`;
  if (!campaign.assetDataUrl) return `${frame}${abstractArtwork(template, brand, x, y, w, h, `${id}-clip`)}`;
  const inset = Math.max(12, Math.min(w, h) * 0.055);
  const innerRadius = Math.max(14, radius * 0.72);
  return `${frame}<defs><clipPath id="${id}-clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath><clipPath id="${id}-inner"><rect x="${x + inset}" y="${y + inset}" width="${w - inset * 2}" height="${h - inset * 2}" rx="${innerRadius}"/></clipPath></defs><g clip-path="url(#${id}-clip)"><image href="${attr(campaign.assetDataUrl)}" x="${x - w * 0.04}" y="${y - h * 0.04}" width="${w * 1.08}" height="${h * 1.08}" preserveAspectRatio="xMidYMid slice" filter="url(#mk-blur)" opacity="0.3"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${brand.primary}" opacity="0.08"/><image href="${attr(campaign.assetDataUrl)}" x="${x + inset}" y="${y + inset}" width="${w - inset * 2}" height="${h - inset * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-inner)" filter="url(#mk-soft-shadow)"/></g>`;
}

export function benefitRow(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, height: number, dark = false) {
  const items = campaign.benefits.filter((item) => clean(item)).slice(0, 3);
  if (!items.length) return "";
  const gap = Math.max(10, width * 0.018);
  const cell = (width - gap * (items.length - 1)) / items.length;
  const fg = dark ? "#FFFFFF" : readableOn(brand.background, brand.primary);
  return items.map((item, index) => {
    const bx = x + index * (cell + gap);
    const fit = fitText(item, cell - 30, height - 28, Math.min(18, cell * 0.075), 12, 680, 2, 1.12);
    return `<g><rect x="${bx}" y="${y}" width="${cell}" height="${height}" rx="${Math.min(20, height * 0.28)}" fill="${dark ? "#FFFFFF" : brand.primary}" opacity="${dark ? 0.08 : 0.055}"/><circle cx="${bx + 18}" cy="${y + 20}" r="5" fill="${brand.accent}"/><text x="${bx + 30}" y="${y + 25}" fill="${fg}" font-size="${fit.size}" font-weight="680" font-family="${fontStack(brand)}">${fit.lines.map((line, lineIndex) => `<tspan x="${bx + 30}" dy="${lineIndex === 0 ? 0 : fit.lineHeight}">${esc(line)}</tspan>`).join("")}</text></g>`;
  }).join("");
}

export function offerPanel(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, height: number, dark = false) {
  const text = clean(campaign.offer, 360);
  if (!text) return "";
  const fg = dark ? "#FFFFFF" : readableOn(brand.background, brand.primary);
  const fit = fitText(text, width - 42, height - 28, Math.min(20, width * 0.03), 13, 560, 3, 1.2);
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.min(22, height * 0.24)}" fill="${dark ? "#FFFFFF" : brand.primary}" opacity="${dark ? 0.07 : 0.05}"/><rect x="${x}" y="${y}" width="5" height="${height}" rx="2.5" fill="${brand.accent}"/>${textBlock(fit, x + 24, baselineFromTop(y + 14, fit), fg, 560, fontStack(brand))}</g>`;
}

export function legalLine(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, color: string) {
  if (!campaign.legal?.trim()) return "";
  const fit = fitText(campaign.legal, width, 34, 12, 9, 450, 2, 1.15);
  return `<g opacity="0.62">${textBlock(fit, x, y, color, 450, fontStack(brand))}</g>`;
}
