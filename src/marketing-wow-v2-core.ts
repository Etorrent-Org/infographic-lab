import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";

export type VariantIndex = 0 | 1 | 2;

export type TextFit = {
  lines: string[];
  size: number;
  lineHeight: number;
  height: number;
  overflow: boolean;
};

export type CandidateMetrics = {
  textOverflow: boolean;
  titleRatio: number;
  heroRatio: number;
  density: number;
  deadZone: number;
  ctaVisible: boolean;
};

export type RenderCandidate = {
  variant: VariantIndex;
  body: string;
  metrics: CandidateMetrics;
  label: string;
};

export type Canvas = {
  w: number;
  h: number;
  safe: number;
  landscape: boolean;
  tall: boolean;
  square: boolean;
};

export function canvasOf(format: MarketingFormat): Canvas {
  const w = format.width;
  const h = format.height;
  const ratio = w / h;
  return {
    w,
    h,
    safe: Math.round(Math.max(44, Math.min(112, Math.min(w, h) * 0.06))),
    landscape: ratio > 1.28,
    tall: ratio < 0.67,
    square: ratio >= 0.88 && ratio <= 1.12,
  };
}

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

export function clean(value: string, max = 2400) {
  const result = String(value ?? "").trim().replace(/\s+/g, " ");
  return result.length > max ? result.slice(0, max).trim() : result;
}

function rgb(value: string) {
  const raw = value.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) return null;
  const hex = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function lum(value: string) {
  const color = rgb(value);
  if (!color) return null;
  const channel = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrast(a: string, b: string) {
  const la = lum(a);
  const lb = lum(b);
  if (la == null || lb == null) return 7;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function readable(background: string, preferred: string) {
  if (contrast(background, preferred) >= 4.2) return preferred;
  return contrast(background, "#0A1020") >= contrast(background, "#FFFFFF") ? "#0A1020" : "#FFFFFF";
}

export function fontFamily(brand: BrandProfile, editorial = false) {
  if (editorial || brand.fontFamily === "serif") return "Georgia,'Times New Roman',serif";
  if (brand.fontFamily === "mono") return "'SFMono-Regular',Consolas,'Liberation Mono',monospace";
  return "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
}

function glyphFactor(char: string) {
  if (char === " ") return 0.29;
  if (/[ilI1|.,'`:;]/.test(char)) return 0.3;
  if (/[MW@#%&]/.test(char)) return 0.9;
  if (/[A-ZÀ-ÖØ-Þ]/.test(char)) return 0.67;
  if (/[0-9]/.test(char)) return 0.58;
  return 0.54;
}

function widthOf(value: string, size: number, weight: number) {
  const weightFactor = weight >= 800 ? 1.04 : weight >= 650 ? 1.02 : 1;
  return Array.from(value).reduce((sum, char) => sum + glyphFactor(char), 0) * size * weightFactor;
}

function splitWord(word: string, maxWidth: number, size: number, weight: number) {
  const chunks: string[] = [];
  let current = "";
  for (const char of Array.from(word)) {
    const next = current + char;
    if (current && widthOf(next, size, weight) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function wrap(value: string, maxWidth: number, size: number, weight: number) {
  const words = clean(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const raw of words) {
    const pieces = widthOf(raw, size, weight) > maxWidth ? splitWord(raw, maxWidth, size, weight) : [raw];
    for (const word of pieces) {
      const next = current ? `${current} ${word}` : word;
      if (widthOf(next, size, weight) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function fitText(
  value: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  preferredMin: number,
  weight: number,
  lineRatio = 1.08,
): TextFit {
  const source = clean(value);
  if (!source) return { lines: [], size: preferredMin, lineHeight: preferredMin * lineRatio, height: 0, overflow: false };

  const absoluteMin = Math.max(8, Math.min(preferredMin, 12));
  for (let size = Math.round(maxSize); size >= absoluteMin; size -= size > 30 ? 2 : 1) {
    const lines = wrap(source, Math.max(1, maxWidth), size, weight);
    const lineHeight = size * lineRatio;
    const height = lines.length ? size + (lines.length - 1) * lineHeight : 0;
    if (height <= maxHeight + 0.5) {
      return { lines, size, lineHeight, height, overflow: size < preferredMin };
    }
  }

  const size = absoluteMin;
  const lines = wrap(source, Math.max(1, maxWidth), size, weight);
  const lineHeight = size * lineRatio;
  return {
    lines,
    size,
    lineHeight,
    height: lines.length ? size + (lines.length - 1) * lineHeight : 0,
    overflow: true,
  };
}

export function baseline(top: number, fit: TextFit) {
  return top + fit.size * 0.82;
}

export function text(fit: TextFit, x: number, y: number, fill: string, weight: number, family: string, anchor: "start" | "middle" | "end" = "start", letterSpacing = 0) {
  if (!fit.lines.length) return "";
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${fit.size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}" letter-spacing="${letterSpacing}">${fit.lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : fit.lineHeight}">${esc(line)}</tspan>`).join("")}</text>`;
}

export function brandLockup(brand: BrandProfile, x: number, baselineY: number, maxWidth: number, color: string) {
  if (brand.logoDataUrl) {
    const h = Math.max(32, Math.min(60, maxWidth * 0.28));
    return `<image href="${attr(brand.logoDataUrl)}" x="${x}" y="${baselineY - h * 0.72}" width="${maxWidth}" height="${h}" preserveAspectRatio="xMinYMid meet"/>`;
  }
  const fit = fitText(brand.name, maxWidth, 36, 22, 13, 820, 1);
  return text(fit, x, baselineY, color, 820, fontFamily(brand), "start", fit.size * 0.045);
}

export function badge(campaign: MarketingCampaign, x: number, y: number, maxWidth: number, bg: string, fg: string) {
  const label = clean(campaign.badge ?? "", 72).toUpperCase();
  if (!label) return "";
  const fit = fitText(label, maxWidth - 34, 26, 15, 10, 850, 1);
  const width = Math.min(maxWidth, Math.max(94, widthOf(fit.lines[0] ?? "", fit.size, 850) + 34));
  const height = 34;
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="17" fill="${bg}"/><text x="${x + width / 2}" y="${y + 22}" fill="${fg}" font-size="${fit.size}" font-weight="850" text-anchor="middle" font-family="Inter,Arial,sans-serif" letter-spacing="1.1">${esc(fit.lines[0] ?? "")}</text></g>`;
}

export function cta(textValue: string, x: number, y: number, width: number, height: number, bg: string, fg: string, square = false) {
  const fit = fitText(clean(textValue, 90), width - 34, height * 0.5, Math.min(20, height * 0.31), 12, 850, 1);
  const radius = square ? Math.min(14, height * 0.22) : height / 2;
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${bg}"/><text x="${x + width / 2}" y="${y + height * 0.64}" fill="${fg}" font-size="${fit.size}" font-weight="850" text-anchor="middle" font-family="Inter,Arial,sans-serif">${esc(fit.lines[0] ?? "")}</text></g>`;
}

export function asset(campaign: MarketingCampaign, x: number, y: number, w: number, h: number, radius: number, id: string, mode: "cover" | "contain" = "cover") {
  if (!campaign.assetDataUrl) return "";
  const preserve = mode === "contain" ? "xMidYMid meet" : "xMidYMid slice";
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><image href="${attr(campaign.assetDataUrl)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${preserve}" clip-path="url(#${id})"/>`;
}

export function richAsset(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, w: number, h: number, id: string, radius = 34) {
  if (!campaign.assetDataUrl) return "";
  return `<g filter="url(#pro-shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${brand.background}"/>${asset(campaign, x, y, w, h, radius, id)}</g>`;
}

export function abstractHero(brand: BrandProfile, x: number, y: number, w: number, h: number, variant: VariantIndex, dark = false) {
  const ink = dark ? "#FFFFFF" : readable(brand.background, brand.primary);
  const accent = brand.accent;
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  if (variant === 0) {
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="url(#pro-wash)"/><circle cx="${x + w * 0.72}" cy="${y + h * 0.28}" r="${Math.min(w, h) * 0.21}" fill="${accent}" opacity="0.26"/><path d="M${x + w * 0.08} ${y + h * 0.75} C${x + w * 0.27} ${y + h * 0.42},${x + w * 0.58} ${y + h * 0.92},${x + w * 0.93} ${y + h * 0.34}" fill="none" stroke="${ink}" stroke-width="3" opacity="0.32"/><rect x="${x + w * 0.15}" y="${y + h * 0.16}" width="${w * 0.34}" height="${h * 0.46}" rx="28" fill="${brand.background}" opacity="0.68" transform="rotate(-8 ${cx} ${cy})" filter="url(#pro-soft-shadow)"/></g>`;
  }
  if (variant === 1) {
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="${dark ? brand.primary : brand.background}"/><circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.31}" fill="none" stroke="${accent}" stroke-width="${Math.max(16, Math.min(w, h) * 0.045)}" opacity="0.7"/><circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.17}" fill="${accent}" opacity="0.22"/><path d="M${x + w * 0.08} ${y + h * 0.9} L${x + w * 0.92} ${y + h * 0.14}" stroke="${ink}" stroke-width="2" opacity="0.2"/></g>`;
  }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="url(#pro-grid)"/><text x="${x + w * 0.5}" y="${y + h * 0.62}" fill="${ink}" opacity="0.08" font-size="${Math.min(w * 0.34, h * 0.46)}" font-weight="950" text-anchor="middle" font-family="Inter,Arial,sans-serif">A</text><line x1="${x + w * 0.13}" y1="${y + h * 0.22}" x2="${x + w * 0.72}" y2="${y + h * 0.22}" stroke="${accent}" stroke-width="8"/><line x1="${x + w * 0.32}" y1="${y + h * 0.78}" x2="${x + w * 0.88}" y2="${y + h * 0.78}" stroke="${ink}" stroke-width="2" opacity="0.18"/></g>`;
}

export function benefits(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, height: number, dark = false) {
  const items = campaign.benefits.map((item) => clean(item, 180)).filter(Boolean).slice(0, 3);
  if (!items.length) return "";
  const gap = Math.max(10, width * 0.018);
  const cell = (width - gap * (items.length - 1)) / items.length;
  const fg = dark ? "#FFFFFF" : readable(brand.background, brand.primary);
  return items.map((item, index) => {
    const bx = x + index * (cell + gap);
    const fit = fitText(item, cell - 34, height - 24, Math.min(18, cell * 0.07), 10, 720, 1.1);
    return `<g><rect x="${bx}" y="${y}" width="${cell}" height="${height}" rx="${Math.min(18, height * 0.24)}" fill="${dark ? "#FFFFFF" : brand.primary}" opacity="${dark ? 0.08 : 0.055}"/><circle cx="${bx + 17}" cy="${y + 20}" r="5" fill="${brand.accent}"/>${text(fit, bx + 29, baseline(y + 12, fit), fg, 720, fontFamily(brand))}</g>`;
  }).join("");
}

export function offer(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, height: number, dark = false) {
  const value = clean(campaign.offer, 420);
  if (!value) return "";
  const fg = dark ? "#FFFFFF" : readable(brand.background, brand.primary);
  const fit = fitText(value, width - 46, height - 24, Math.min(20, width * 0.03), 10, 560, 1.2);
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.min(20, height * 0.24)}" fill="${dark ? "#FFFFFF" : brand.primary}" opacity="${dark ? 0.075 : 0.05}"/><rect x="${x}" y="${y}" width="5" height="${height}" rx="2.5" fill="${brand.accent}"/>${text(fit, x + 24, baseline(y + 12, fit), fg, 560, fontFamily(brand))}</g>`;
}

export function legal(campaign: MarketingCampaign, x: number, y: number, width: number, color: string) {
  const value = clean(campaign.legal ?? "", 380);
  if (!value) return "";
  const fit = fitText(value, width, 34, 11, 8, 450, 1.12);
  return text(fit, x, y, color, 450, "Inter,Arial,sans-serif");
}

export function defs(brand: BrandProfile) {
  return `<defs>
    <linearGradient id="pro-wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${brand.accent}" stop-opacity="0.28"/><stop offset="58%" stop-color="${brand.background}" stop-opacity="0.04"/><stop offset="100%" stop-color="${brand.primary}" stop-opacity="0.12"/></linearGradient>
    <linearGradient id="pro-dark-wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${brand.primary}"/><stop offset="70%" stop-color="${brand.primary}"/><stop offset="100%" stop-color="${brand.accent}" stop-opacity="0.42"/></linearGradient>
    <radialGradient id="pro-halo" cx="50%" cy="45%" r="58%"><stop offset="0%" stop-color="${brand.accent}" stop-opacity="0.45"/><stop offset="100%" stop-color="${brand.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="pro-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${brand.primary}" stroke-opacity="0.055" stroke-width="1"/></pattern>
    <pattern id="pro-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="${brand.primary}" opacity="0.12"/></pattern>
    <filter id="pro-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#0B1020" flood-opacity="0.22"/></filter>
    <filter id="pro-soft-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="11" stdDeviation="15" flood-color="#0B1020" flood-opacity="0.13"/></filter>
    <filter id="pro-blur"><feGaussianBlur stdDeviation="24"/></filter>
  </defs>`;
}

export function contentDensity(campaign: MarketingCampaign) {
  return clean(campaign.headline).length * 1.5 + clean(campaign.subheadline).length + clean(campaign.offer).length * 0.65 + campaign.benefits.join(" ").length * 0.55 + (campaign.legal?.length ?? 0) * 0.35;
}

export function preferredVariant(campaign: MarketingCampaign, format: MarketingFormat): VariantIndex {
  const c = canvasOf(format);
  const density = contentDensity(campaign);
  if (campaign.assetDataUrl && (c.landscape || density < 180)) return 0;
  if (campaign.assetDataUrl && (c.tall || density < 320)) return 1;
  if (density > 430 || clean(campaign.headline).length > 82 || c.tall) return 2;
  return campaign.assetDataUrl ? 1 : 2;
}

export function makeCandidate(variant: VariantIndex, label: string, body: string, fits: TextFit[], canvas: Canvas, heroRatio: number, deadZone: number, ctaVisible = true): RenderCandidate {
  const title = fits[0];
  const textHeight = fits.reduce((sum, fit) => sum + fit.height, 0);
  return {
    variant,
    label,
    body,
    metrics: {
      textOverflow: fits.some((fit) => fit.overflow),
      titleRatio: title ? title.height / Math.max(1, canvas.h - canvas.safe * 2) : 0,
      heroRatio,
      density: textHeight / Math.max(1, canvas.h - canvas.safe * 2),
      deadZone,
      ctaVisible,
    },
  };
}

export function qualityPenalty(candidate: RenderCandidate) {
  const m = candidate.metrics;
  let penalty = 0;
  if (m.textOverflow) penalty += 120;
  if (m.titleRatio > 0.38) penalty += (m.titleRatio - 0.38) * 220;
  if (m.heroRatio < 0.18) penalty += (0.18 - m.heroRatio) * 140;
  if (m.density > 0.74) penalty += (m.density - 0.74) * 180;
  if (m.deadZone > 0.34) penalty += (m.deadZone - 0.34) * 120;
  if (!m.ctaVisible) penalty += 80;
  return penalty;
}

export function chooseCandidate(candidates: RenderCandidate[], preferred: VariantIndex) {
  return [...candidates].sort((a, b) => {
    const aScore = qualityPenalty(a) + (a.variant === preferred ? 0 : 8 + Math.abs(a.variant - preferred) * 4);
    const bScore = qualityPenalty(b) + (b.variant === preferred ? 0 : 8 + Math.abs(b.variant - preferred) * 4);
    return aScore - bScore;
  })[0] ?? candidates[0];
}

export function wrapSvg(format: MarketingFormat, headline: string, body: string, variantLabel: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${format.width}" height="${format.height}" viewBox="0 0 ${format.width} ${format.height}" role="img" aria-label="${attr(headline)}" data-layout="${attr(variantLabel)}">${body}</svg>`;
}
