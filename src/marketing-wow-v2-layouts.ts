import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  asset,
  badge,
  baseline,
  benefits,
  brandLockup,
  canvasOf,
  clean,
  cta,
  defs,
  esc,
  fitText,
  fontFamily,
  legal,
  makeCandidate,
  offer,
  readable,
  richAsset,
  text,
  type RenderCandidate,
  type VariantIndex,
} from "./marketing-wow-v2-core";

function trendDefs(brand: BrandProfile) {
  return `${defs(brand)}<defs>
    <pattern id="trend-grain" width="18" height="18" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="3" r="1" fill="${brand.primary}" opacity="0.055"/>
      <circle cx="13" cy="10" r="0.8" fill="${brand.accent}" opacity="0.08"/>
    </pattern>
    <pattern id="trend-lines" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M0 28L28 0" stroke="${brand.primary}" stroke-width="1" opacity="0.045"/>
    </pattern>
    <linearGradient id="trend-dark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E1118"/>
      <stop offset="62%" stop-color="#171B24"/>
      <stop offset="100%" stop-color="${brand.primary}" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="trend-vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090B11" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#090B11" stop-opacity="0.82"/>
    </linearGradient>
  </defs>`;
}

function titleFit(campaign: MarketingCampaign, width: number, height: number, maxSize: number, minSize = 28) {
  return fitText(clean(campaign.headline, 260), width, height, maxSize, minSize, 880, 0.98);
}

function subFit(campaign: MarketingCampaign, width: number, height: number, maxSize: number, minSize = 15) {
  return fitText(clean(campaign.subheadline, 420), width, height, maxSize, minSize, 520, 1.18);
}

function offerFit(campaign: MarketingCampaign, width: number, height: number, maxSize = 24) {
  return fitText(clean(campaign.offer, 480), width, height, maxSize, 13, 560, 1.18);
}

function kicker(value: string, x: number, y: number, color: string, accent: string) {
  const cleanValue = clean(value, 80).toUpperCase();
  return `<g><rect x="${x}" y="${y - 12}" width="28" height="4" rx="2" fill="${accent}"/><text x="${x + 40}" y="${y}" fill="${color}" font-size="13" font-weight="800" font-family="Inter,Arial,sans-serif" letter-spacing="2.2">${esc(cleanValue)}</text></g>`;
}

function priceBlock(campaign: MarketingCampaign, x: number, y: number, width: number, height: number, bg: string, fg: string, accent: string) {
  const value = clean(campaign.price ?? campaign.badge ?? "", 48);
  if (!value) return "";
  const fit = fitText(value, width - 30, height * 0.55, Math.min(72, height * 0.55), 24, 920, 0.96);
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.min(28, height * 0.2)}" fill="${bg}"/><rect x="${x + 16}" y="${y + 16}" width="28" height="5" rx="2.5" fill="${accent}"/>${text(fit, x + width / 2, y + height * 0.63, fg, 920, "Inter,Arial,sans-serif", "middle")}</g>`;
}

function editorialCard(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, w: number, h: number, id: string) {
  if (campaign.assetDataUrl) return richAsset(campaign, brand, x, y, w, h, id, 28);
  const ink = readable(brand.background, brand.primary);
  const fit = offerFit(campaign, w * 0.7, h * 0.42, Math.min(30, w * 0.05));
  return `<g filter="url(#pro-soft-shadow)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${brand.background}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="url(#trend-grain)"/>
    <circle cx="${x + w * 0.79}" cy="${y + h * 0.22}" r="${Math.min(w, h) * 0.13}" fill="${brand.accent}" opacity="0.3"/>
    <text x="${x + w * 0.1}" y="${y + h * 0.26}" fill="${brand.primary}" opacity="0.12" font-size="${Math.min(w, h) * 0.28}" font-family="Georgia,serif">“</text>
    ${text(fit, x + w * 0.1, baseline(y + h * 0.38, fit), ink, 560, fontFamily(brand, true))}
    <line x1="${x + w * 0.1}" y1="${y + h * 0.82}" x2="${x + w * 0.74}" y2="${y + h * 0.82}" stroke="${brand.primary}" opacity="0.18"/>
    <rect x="${x + w * 0.1}" y="${y + h * 0.87}" width="${w * 0.2}" height="6" rx="3" fill="${brand.accent}"/>
  </g>`;
}

function candidate(
  variant: VariantIndex,
  label: string,
  body: string,
  fits: ReturnType<typeof fitText>[],
  format: MarketingFormat,
  heroRatio: number,
  deadZone: number,
  ctaVisible = true,
): RenderCandidate {
  return makeCandidate(variant, label, body, fits, canvasOf(format), heroRatio, deadZone, ctaVisible);
}

function editorialSplit(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const ink = readable(brand.background, brand.primary);
  const safe = c.safe;
  const serif = fontFamily(brand, true);
  const sans = fontFamily(brand);
  const landscape = c.landscape;
  const heroX = landscape ? c.w * 0.58 : safe;
  const heroY = landscape ? safe : safe + 90;
  const heroW = landscape ? c.w - heroX - safe : c.w - safe * 2;
  const heroH = landscape ? c.h - safe * 2 : Math.min(c.h * 0.36, c.w * 0.52);
  const textX = safe;
  const textY = landscape ? safe + 84 : heroY + heroH + 54;
  const textW = landscape ? c.w * 0.47 : c.w - safe * 2;
  const availableH = c.h - textY - safe;
  const title = titleFit(campaign, textW, availableH * 0.44, Math.min(96, textW * 0.16), 30);
  const sub = subFit(campaign, textW, availableH * 0.24, Math.min(27, textW * 0.045), 16);
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#trend-grain)"/>
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), ink)}
    ${editorialCard(campaign, brand, heroX, heroY, heroW, heroH, "editorial-split-asset")}
    ${kicker(campaign.badge || "Editorial / 01", textX, textY, ink, brand.accent)}
    ${text(title, textX, baseline(textY + 52, title), ink, 880, serif)}
    ${text(sub, textX, baseline(textY + 74 + title.height, sub), ink, 520, sans)}
    ${cta(campaign.cta, textX, Math.min(c.h - safe - 58, textY + title.height + sub.height + 120), Math.min(210, textW * 0.48), 52, brand.primary, readable(brand.primary, "#FFFFFF"), true)}
    ${legal(campaign, textX, c.h - safe * 0.46, textW, ink)}`;
  return candidate(0, "editorial-split", body, [title, sub], format, campaign.assetDataUrl ? 0.43 : 0.31, 0.08);
}

function editorialCover(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const dark = "#11141B";
  const ink = "#FFFFFF";
  const titleW = c.landscape ? c.w * 0.48 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.34, Math.min(112, c.w * 0.11), 30);
  const sub = subFit(campaign, titleW, c.h * 0.18, Math.min(30, c.w * 0.03), 16);
  const image = campaign.assetDataUrl
    ? `${asset(campaign, 0, 0, c.w, c.h, 0, "editorial-cover-asset")}<rect width="${c.w}" height="${c.h}" fill="url(#trend-vignette)"/>`
    : `<rect width="${c.w}" height="${c.h}" fill="url(#trend-dark)"/><rect width="${c.w}" height="${c.h}" fill="url(#trend-lines)"/><circle cx="${c.w * 0.82}" cy="${c.h * 0.2}" r="${Math.min(c.w, c.h) * 0.22}" fill="${brand.accent}" opacity="0.16"/>`;
  const y = c.landscape ? safe + 42 : c.h * 0.42;
  const body = `${trendDefs(brand)}${image}
    ${brandLockup(brand, safe, safe + 24, Math.min(240, c.w * 0.25), ink)}
    ${kicker(campaign.badge || "Perspective", safe, y, ink, brand.accent)}
    ${text(title, safe, baseline(y + 54, title), ink, 880, fontFamily(brand, true))}
    ${text(sub, safe, baseline(y + 80 + title.height, sub), ink, 520, fontFamily(brand))}
    <line x1="${safe}" y1="${c.h - safe - 82}" x2="${c.w - safe}" y2="${c.h - safe - 82}" stroke="#FFFFFF" opacity="0.22"/>
    ${cta(campaign.cta, safe, c.h - safe - 60, Math.min(220, c.w * 0.24), 52, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "editorial-cover", body, [title, sub], format, campaign.assetDataUrl ? 0.56 : 0.3, 0.06);
}

function editorialTypographic(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const width = c.w - safe * 2;
  const title = titleFit(campaign, width * (c.landscape ? 0.63 : 0.9), c.h * 0.38, Math.min(128, c.w * 0.12), 28);
  const sub = subFit(campaign, width * (c.landscape ? 0.58 : 0.82), c.h * 0.2, Math.min(28, c.w * 0.029), 15);
  const startY = safe + Math.max(100, c.h * 0.14);
  const sideX = c.w - safe - Math.min(220, c.w * 0.2);
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#trend-lines)"/>
    ${brandLockup(brand, safe, safe + 26, Math.min(220, c.w * 0.24), ink)}
    <text x="${sideX}" y="${safe + 32}" fill="${ink}" opacity="0.24" font-size="13" font-family="Inter,Arial,sans-serif" letter-spacing="2">ISSUE / 01</text>
    <rect x="${safe}" y="${startY - 34}" width="${Math.min(92, width * 0.12)}" height="8" rx="4" fill="${brand.accent}"/>
    ${text(title, safe, baseline(startY, title), ink, 880, fontFamily(brand, true))}
    ${text(sub, safe, baseline(startY + title.height + 56, sub), ink, 520, fontFamily(brand))}
    ${offer(campaign, brand, safe, Math.min(c.h - safe - 210, startY + title.height + sub.height + 110), Math.min(width, c.landscape ? width * 0.62 : width), 112)}
    ${benefits(campaign, brand, safe, c.h - safe - 112, width, 82)}
    <text x="${c.w - safe}" y="${c.h - safe * 0.45}" text-anchor="end" fill="${ink}" opacity="0.48" font-size="12" font-family="Inter,Arial,sans-serif" letter-spacing="1.6">STRUCTURED SIMPLICITY</text>`;
  return candidate(2, "editorial-typographic", body, [title, sub], format, 0.24, 0.05);
}

export function editorialCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [editorialSplit(campaign, brand, format), editorialCover(campaign, brand, format), editorialTypographic(campaign, brand, format)];
}

function impactDiagonal(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const width = c.w - safe * 2;
  const title = titleFit(campaign, width * (c.landscape ? 0.62 : 0.9), c.h * 0.36, Math.min(128, c.w * 0.12), 30);
  const sub = subFit(campaign, width * 0.72, c.h * 0.18, Math.min(28, c.w * 0.03), 15);
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#0E1118"/>
    <polygon points="${c.w * 0.66},0 ${c.w},0 ${c.w},${c.h * 0.62} ${c.w * 0.52},${c.h}" fill="${brand.accent}" opacity="0.92"/>
    <polygon points="${c.w * 0.76},0 ${c.w},0 ${c.w},${c.h * 0.44} ${c.w * 0.64},${c.h * 0.74}" fill="#FFFFFF" opacity="0.11"/>
    ${campaign.assetDataUrl ? asset(campaign, c.w * 0.58, c.h * 0.14, c.w * 0.34, c.h * 0.42, 24, "impact-diagonal-asset") : ""}
    ${brandLockup(brand, safe, safe + 22, Math.min(220, c.w * 0.22), "#FFFFFF")}
    ${kicker(campaign.badge || "Campaign / Bold", safe, c.h * 0.24, "#FFFFFF", brand.accent)}
    ${text(title, safe, baseline(c.h * 0.29, title), "#FFFFFF", 900, fontFamily(brand))}
    ${text(sub, safe, baseline(c.h * 0.31 + title.height + 38, sub), "#FFFFFF", 520, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(220, width * 0.28), 54, "#FFFFFF", "#0E1118", true)}
    ${badge(campaign, c.w - safe - 180, c.h - safe - 54, 180, "#0E1118", "#FFFFFF")}`;
  return candidate(0, "impact-diagonal", body, [title, sub], format, campaign.assetDataUrl ? 0.36 : 0.29, 0.04);
}

function impactPoster(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const title = titleFit(campaign, c.w - safe * 2, c.h * 0.43, Math.min(150, c.w * 0.14), 30);
  const sub = subFit(campaign, c.w * 0.62, c.h * 0.18, Math.min(26, c.w * 0.027), 15);
  const top = safe + Math.max(84, c.h * 0.12);
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#11141B"/>
    <rect x="${safe}" y="${safe}" width="${c.w - safe * 2}" height="${c.h - safe * 2}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.28"/>
    <rect x="${safe}" y="${safe}" width="${Math.min(170, c.w * 0.18)}" height="14" fill="${brand.accent}"/>
    <text x="${c.w - safe}" y="${safe + 16}" text-anchor="end" fill="#FFFFFF" opacity="0.56" font-size="13" font-family="Inter,Arial,sans-serif" letter-spacing="2.4">CAMPAIGN / NOW</text>
    ${text(title, safe, baseline(top, title), "#FFFFFF", 930, fontFamily(brand))}
    <line x1="${safe}" y1="${top + title.height + 38}" x2="${c.w - safe}" y2="${top + title.height + 38}" stroke="${brand.accent}" stroke-width="10"/>
    ${text(sub, safe, baseline(top + title.height + 84, sub), "#FFFFFF", 520, fontFamily(brand))}
    ${benefits(campaign, brand, safe, c.h - safe - 170, c.w - safe * 2, 92, true)}
    ${cta(campaign.cta, safe, c.h - safe - 62, Math.min(220, c.w * 0.3), 54, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "impact-poster", body, [title, sub], format, 0.3, 0.03);
}

function impactSplitBlast(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const assetW = c.landscape ? c.w * 0.44 : c.w - safe * 2;
  const assetH = c.landscape ? c.h - safe * 2 : c.h * 0.34;
  const assetX = c.landscape ? c.w - safe - assetW : safe;
  const assetY = c.landscape ? safe : safe;
  const textX = safe;
  const textY = c.landscape ? safe + 80 : assetY + assetH + 56;
  const textW = c.landscape ? c.w * 0.46 : c.w - safe * 2;
  const title = titleFit(campaign, textW, c.h * 0.33, Math.min(112, textW * 0.2), 28);
  const sub = subFit(campaign, textW, c.h * 0.18, Math.min(27, textW * 0.055), 15);
  const visual = campaign.assetDataUrl
    ? richAsset(campaign, brand, assetX, assetY, assetW, assetH, "impact-split-asset", 20)
    : `<g><rect x="${assetX}" y="${assetY}" width="${assetW}" height="${assetH}" rx="20" fill="${brand.accent}"/><text x="${assetX + assetW / 2}" y="${assetY + assetH * 0.6}" text-anchor="middle" fill="${readable(brand.accent, "#10131A")}" font-size="${Math.min(assetW, assetH) * 0.3}" font-weight="950" font-family="Inter,Arial,sans-serif">!</text></g>`;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#0D1017"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#trend-lines)"/>
    ${visual}
    ${brandLockup(brand, textX, textY - 34, Math.min(200, textW * 0.45), "#FFFFFF")}
    ${text(title, textX, baseline(textY + 28, title), "#FFFFFF", 900, fontFamily(brand))}
    ${text(sub, textX, baseline(textY + title.height + 62, sub), "#FFFFFF", 520, fontFamily(brand))}
    ${cta(campaign.cta, textX, Math.min(c.h - safe - 60, textY + title.height + sub.height + 112), Math.min(220, textW * 0.5), 52, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(2, "impact-split-blast", body, [title, sub], format, campaign.assetDataUrl ? 0.44 : 0.32, 0.05);
}

export function impactCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [impactDiagonal(campaign, brand, format), impactPoster(campaign, brand, format), impactSplitBlast(campaign, brand, format)];
}

function spotlightCenter(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const heroW = Math.min(c.w - safe * 2, c.landscape ? c.w * 0.42 : c.w * 0.68);
  const heroH = c.landscape ? c.h * 0.58 : c.h * 0.36;
  const heroX = c.landscape ? c.w * 0.54 : (c.w - heroW) / 2;
  const heroY = c.landscape ? c.h * 0.2 : c.h * 0.18;
  const textW = c.landscape ? c.w * 0.43 : c.w - safe * 2;
  const textY = c.landscape ? c.h * 0.26 : heroY + heroH + 56;
  const title = titleFit(campaign, textW, c.h * 0.3, Math.min(100, textW * 0.17), 28);
  const sub = subFit(campaign, textW, c.h * 0.16, Math.min(26, textW * 0.05), 15);
  const visual = campaign.assetDataUrl
    ? richAsset(campaign, brand, heroX, heroY, heroW, heroH, "spotlight-center-asset", 34)
    : `<g filter="url(#pro-soft-shadow)"><rect x="${heroX}" y="${heroY}" width="${heroW}" height="${heroH}" rx="34" fill="#FFFFFF"/><rect x="${heroX + heroW * 0.1}" y="${heroY + heroH * 0.12}" width="${heroW * 0.8}" height="${heroH * 0.56}" rx="24" fill="${brand.primary}" opacity="0.055"/>${priceBlock(campaign, heroX + heroW * 0.16, heroY + heroH * 0.26, heroW * 0.68, heroH * 0.34, brand.accent, readable(brand.accent, "#10131A"), brand.primary)}</g>`;
  const textX = c.landscape ? safe : safe;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#trend-grain)"/>
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), ink)}
    ${visual}
    ${kicker(campaign.badge || "Spotlight", textX, textY, ink, brand.accent)}
    ${text(title, textX, baseline(textY + 52, title), ink, 880, fontFamily(brand))}
    ${text(sub, textX, baseline(textY + title.height + 78, sub), ink, 520, fontFamily(brand))}
    ${cta(campaign.cta, textX, Math.min(c.h - safe - 60, textY + title.height + sub.height + 116), Math.min(220, textW * 0.48), 52, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(0, "spotlight-center-stage", body, [title, sub], format, campaign.assetDataUrl ? 0.5 : 0.33, 0.05);
}

function spotlightSplit(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const leftW = c.landscape ? c.w * 0.48 : c.w - safe * 2;
  const title = titleFit(campaign, leftW, c.h * 0.3, Math.min(104, leftW * 0.18), 28);
  const sub = subFit(campaign, leftW, c.h * 0.16, Math.min(26, leftW * 0.05), 15);
  const heroX = c.landscape ? c.w * 0.56 : safe;
  const heroY = c.landscape ? safe : c.h * 0.48;
  const heroW = c.landscape ? c.w - heroX - safe : c.w - safe * 2;
  const heroH = c.landscape ? c.h - safe * 2 : c.h - heroY - safe;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="${heroX - 20}" y="${heroY - 20}" width="${heroW + 40}" height="${heroH + 40}" rx="40" fill="${brand.primary}" opacity="0.045"/>
    ${campaign.assetDataUrl ? richAsset(campaign, brand, heroX, heroY, heroW, heroH, "spotlight-split-asset", 28) : `${priceBlock(campaign, heroX, heroY, heroW, Math.min(heroH, 190), brand.primary, readable(brand.primary, "#FFFFFF"), brand.accent)}${offer(campaign, brand, heroX, heroY + Math.min(heroH, 220), heroW, Math.min(130, heroH * 0.28))}`}
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), ink)}
    ${kicker(campaign.badge || "Offer / Focus", safe, safe + 112, ink, brand.accent)}
    ${text(title, safe, baseline(safe + 164, title), ink, 880, fontFamily(brand))}
    ${text(sub, safe, baseline(safe + 190 + title.height, sub), ink, 520, fontFamily(brand))}
    ${benefits(campaign, brand, safe, Math.min(c.h - safe - 170, safe + title.height + sub.height + 280), c.landscape ? leftW : c.w - safe * 2, 86)}
    ${cta(campaign.cta, safe, c.h - safe - 60, Math.min(220, leftW * 0.48), 52, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "spotlight-split-hero", body, [title, sub], format, campaign.assetDataUrl ? 0.46 : 0.35, 0.04);
}

function spotlightFullBleed(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const titleW = c.landscape ? c.w * 0.52 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.3, Math.min(108, c.w * 0.1), 28);
  const sub = subFit(campaign, titleW, c.h * 0.16, Math.min(27, c.w * 0.028), 15);
  const background = campaign.assetDataUrl
    ? `${asset(campaign, 0, 0, c.w, c.h, 0, "spotlight-full-asset")}<rect width="${c.w}" height="${c.h}" fill="url(#trend-vignette)"/>`
    : `<rect width="${c.w}" height="${c.h}" fill="#11151D"/><rect width="${c.w}" height="${c.h}" fill="url(#trend-lines)"/><circle cx="${c.w * 0.72}" cy="${c.h * 0.42}" r="${Math.min(c.w, c.h) * 0.27}" fill="${brand.accent}" opacity="0.22"/>`;
  const y = c.landscape ? c.h * 0.2 : c.h * 0.5;
  const body = `${trendDefs(brand)}${background}
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), "#FFFFFF")}
    ${badge(campaign, safe, y - 52, Math.min(220, titleW), brand.accent, readable(brand.accent, "#10131A"))}
    ${text(title, safe, baseline(y, title), "#FFFFFF", 900, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 46, sub), "#FFFFFF", 520, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 62, Math.min(220, titleW * 0.46), 54, "#FFFFFF", "#11151D", true)}
    ${priceBlock(campaign, c.w - safe - Math.min(240, c.w * 0.24), c.h - safe - 132, Math.min(240, c.w * 0.24), 110, brand.accent, readable(brand.accent, "#10131A"), "#FFFFFF")}`;
  return candidate(2, "spotlight-full-bleed", body, [title, sub], format, campaign.assetDataUrl ? 0.6 : 0.34, 0.05);
}

export function spotlightCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [spotlightCenter(campaign, brand, format), spotlightSplit(campaign, brand, format), spotlightFullBleed(campaign, brand, format)];
}

function retailOfferHero(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const title = titleFit(campaign, c.w - safe * 2, c.h * 0.25, Math.min(96, c.w * 0.09), 26);
  const sub = subFit(campaign, c.w - safe * 2, c.h * 0.12, Math.min(24, c.w * 0.025), 14);
  const priceW = Math.min(c.w - safe * 2, c.landscape ? c.w * 0.34 : c.w * 0.62);
  const priceY = safe + 100;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="0" y="0" width="${c.w}" height="${Math.min(c.h * 0.18, 240)}" fill="${brand.primary}"/>
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), readable(brand.primary, "#FFFFFF"))}
    ${badge(campaign, c.w - safe - Math.min(200, c.w * 0.22), safe, Math.min(200, c.w * 0.22), brand.accent, readable(brand.accent, "#10131A"))}
    ${priceBlock(campaign, safe, priceY, priceW, Math.min(210, c.h * 0.18), brand.accent, readable(brand.accent, "#10131A"), brand.primary)}
    ${text(title, safe, baseline(priceY + Math.min(250, c.h * 0.22), title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(priceY + Math.min(270, c.h * 0.22) + title.height, sub), ink, 520, fontFamily(brand))}
    ${benefits(campaign, brand, safe, c.h - safe - 172, c.w - safe * 2, 94)}
    ${cta(campaign.cta, safe, c.h - safe - 62, Math.min(240, c.w * 0.3), 54, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(0, "retail-offer-hero", body, [title, sub], format, 0.36, 0.03);
}

function retailShelf(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const title = titleFit(campaign, c.w - safe * 2, c.h * 0.24, Math.min(88, c.w * 0.085), 25);
  const sub = subFit(campaign, c.w - safe * 2, c.h * 0.12, Math.min(23, c.w * 0.024), 14);
  const heroY = c.h * 0.38;
  const heroH = c.h * 0.3;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#trend-grain)"/>
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), ink)}
    ${kicker(campaign.badge || "Offer / Clear", safe, safe + 106, ink, brand.accent)}
    ${text(title, safe, baseline(safe + 152, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(safe + 176 + title.height, sub), ink, 520, fontFamily(brand))}
    ${campaign.assetDataUrl ? richAsset(campaign, brand, safe, heroY, c.w - safe * 2, heroH, "retail-shelf-asset", 26) : `${offer(campaign, brand, safe, heroY, c.w - safe * 2, Math.min(120, heroH * 0.38))}${priceBlock(campaign, safe, heroY + Math.min(145, heroH * 0.44), Math.min(300, c.w * 0.32), Math.min(150, heroH * 0.46), brand.primary, readable(brand.primary, "#FFFFFF"), brand.accent)}`}
    ${benefits(campaign, brand, safe, c.h - safe - 170, c.w - safe * 2, 90)}
    ${cta(campaign.cta, c.w - safe - Math.min(240, c.w * 0.3), c.h - safe - 62, Math.min(240, c.w * 0.3), 54, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "retail-shelf", body, [title, sub], format, campaign.assetDataUrl ? 0.42 : 0.32, 0.04);
}

function retailFlyer(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const dark = "#10131A";
  const titleW = c.landscape ? c.w * 0.5 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.28, Math.min(100, c.w * 0.09), 26);
  const sub = subFit(campaign, titleW, c.h * 0.13, Math.min(24, c.w * 0.025), 14);
  const visualX = c.landscape ? c.w * 0.58 : safe;
  const visualY = c.landscape ? safe : c.h * 0.5;
  const visualW = c.landscape ? c.w - visualX - safe : c.w - safe * 2;
  const visualH = c.landscape ? c.h - safe * 2 : c.h - visualY - safe * 1.6;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${dark}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#trend-lines)"/>
    <rect x="${visualX}" y="${visualY}" width="${visualW}" height="${visualH}" rx="28" fill="${brand.background}"/>
    ${campaign.assetDataUrl ? asset(campaign, visualX, visualY, visualW, visualH, 28, "retail-flyer-asset") : `${priceBlock(campaign, visualX + visualW * 0.08, visualY + visualH * 0.12, visualW * 0.84, visualH * 0.32, brand.accent, readable(brand.accent, "#10131A"), dark)}${offer(campaign, brand, visualX + visualW * 0.08, visualY + visualH * 0.54, visualW * 0.84, Math.min(120, visualH * 0.25))}`}
    ${brandLockup(brand, safe, safe + 24, Math.min(220, c.w * 0.24), "#FFFFFF")}
    ${badge(campaign, safe, safe + 76, Math.min(220, titleW), brand.accent, readable(brand.accent, dark))}
    ${text(title, safe, baseline(safe + 142, title), "#FFFFFF", 910, fontFamily(brand))}
    ${text(sub, safe, baseline(safe + 168 + title.height, sub), "#FFFFFF", 520, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 62, Math.min(230, titleW * 0.46), 54, "#FFFFFF", dark, true)}`;
  return candidate(2, "retail-flyer", body, [title, sub], format, campaign.assetDataUrl ? 0.44 : 0.34, 0.03);
}

export function retailCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [retailOfferHero(campaign, brand, format), retailShelf(campaign, brand, format), retailFlyer(campaign, brand, format)];
}
