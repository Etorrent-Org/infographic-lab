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
    <pattern id="creative-grain" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="5" r="1" fill="${brand.primary}" opacity="0.055"/>
      <circle cx="21" cy="16" r="0.8" fill="${brand.accent}" opacity="0.09"/>
      <circle cx="29" cy="27" r="0.7" fill="${brand.primary}" opacity="0.04"/>
    </pattern>
    <pattern id="creative-grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M36 0H0V36" fill="none" stroke="${brand.primary}" stroke-width="1" opacity="0.05"/>
    </pattern>
    <pattern id="creative-hatch" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
      <line x1="0" y1="0" x2="0" y2="26" stroke="${brand.primary}" stroke-width="1" opacity="0.07"/>
    </pattern>
    <linearGradient id="creative-dark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0D14"/>
      <stop offset="58%" stop-color="#151A24"/>
      <stop offset="100%" stop-color="${brand.primary}"/>
    </linearGradient>
    <linearGradient id="creative-accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.accent}"/>
      <stop offset="100%" stop-color="${brand.primary}"/>
    </linearGradient>
    <linearGradient id="creative-vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#080A0E" stop-opacity="0.08"/>
      <stop offset="58%" stop-color="#080A0E" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#080A0E" stop-opacity="0.88"/>
    </linearGradient>
  </defs>`;
}

function titleFit(campaign: MarketingCampaign, width: number, height: number, maxSize: number, minSize = 28) {
  return fitText(clean(campaign.headline, 260), width, height, maxSize, minSize, 900, 0.96);
}

function subFit(campaign: MarketingCampaign, width: number, height: number, maxSize: number, minSize = 15) {
  return fitText(clean(campaign.subheadline, 420), width, height, maxSize, minSize, 540, 1.16);
}

function offerFit(campaign: MarketingCampaign, width: number, height: number, maxSize = 24) {
  return fitText(clean(campaign.offer, 480), width, height, maxSize, 13, 600, 1.14);
}

function microLabel(value: string, x: number, y: number, color: string, accent: string, max = 84) {
  const label = clean(value, max).toUpperCase();
  if (!label) return "";
  return `<g><rect x="${x}" y="${y - 12}" width="30" height="5" rx="2.5" fill="${accent}"/><text x="${x + 42}" y="${y}" fill="${color}" font-size="13" font-weight="820" font-family="Inter,Arial,sans-serif" letter-spacing="1.8">${esc(label)}</text></g>`;
}

function targetChip(campaign: MarketingCampaign, x: number, y: number, maxWidth: number, bg: string, fg: string) {
  const value = clean(campaign.target, 90);
  if (!value) return "";
  const fit = fitText(value, maxWidth - 38, 26, 14, 10, 760, 1);
  const width = Math.min(maxWidth, Math.max(130, Math.min(maxWidth, (fit.lines[0]?.length ?? 8) * fit.size * 0.62 + 42)));
  return `<g><rect x="${x}" y="${y}" width="${width}" height="38" rx="19" fill="${bg}"/><text x="${x + 20}" y="${y + 24}" fill="${fg}" font-size="${fit.size}" font-weight="760" font-family="Inter,Arial,sans-serif">${esc(fit.lines[0] ?? value)}</text></g>`;
}

function priceBlock(campaign: MarketingCampaign, x: number, y: number, width: number, height: number, bg: string, fg: string, accent: string) {
  const value = clean(campaign.price ?? campaign.badge ?? "", 48);
  if (!value) return "";
  const fit = fitText(value, width - 34, height * 0.58, Math.min(78, height * 0.55), 24, 950, 0.94);
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.min(26, height * 0.18)}" fill="${bg}"/><rect x="${x + 18}" y="${y + 18}" width="34" height="6" rx="3" fill="${accent}"/>${text(fit, x + width / 2, y + height * 0.66, fg, 950, "Inter,Arial,sans-serif", "middle")}</g>`;
}

function benefitRail(campaign: MarketingCampaign, x: number, y: number, width: number, color: string, accent: string) {
  const items = campaign.benefits.map((item) => clean(item, 90)).filter(Boolean).slice(0, 3);
  if (!items.length) return "";
  const gap = 14;
  const cell = (width - gap * (items.length - 1)) / items.length;
  return items.map((item, index) => {
    const bx = x + index * (cell + gap);
    const fit = fitText(item, cell - 28, 48, Math.min(15, cell * 0.055), 10, 700, 1.08);
    return `<g><rect x="${bx}" y="${y}" width="${cell}" height="64" rx="16" fill="${color}" opacity="0.07"/><rect x="${bx + 14}" y="${y + 14}" width="22" height="4" rx="2" fill="${accent}"/>${text(fit, bx + 14, baseline(y + 30, fit), color, 700, "Inter,Arial,sans-serif")}</g>`;
  }).join("");
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
  const safe = c.safe;
  const portrait = !c.landscape;
  const panelW = portrait ? c.w * 0.34 : c.w * 0.36;
  const ink = readable(brand.background, brand.primary);
  const lightX = panelW + safe * 0.72;
  const lightW = c.w - lightX - safe;
  const title = titleFit(campaign, lightW, c.h * (portrait ? 0.34 : 0.42), Math.min(112, lightW * 0.19), 30);
  const sub = subFit(campaign, lightW, c.h * 0.18, Math.min(27, lightW * 0.05), 15);
  const offerText = offerFit(campaign, panelW - safe * 1.2, c.h * 0.24, Math.min(25, panelW * 0.075));
  const titleY = portrait ? c.h * 0.27 : c.h * 0.24;
  const subY = titleY + title.height + 52;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="0" y="0" width="${panelW}" height="${c.h}" fill="${brand.primary}"/>
    <rect x="0" y="0" width="${panelW}" height="${c.h}" fill="url(#creative-hatch)" opacity="0.7"/>
    <rect x="${panelW - 8}" y="${safe * 0.7}" width="16" height="${c.h - safe * 1.4}" rx="8" fill="${brand.accent}"/>
    ${brandLockup(brand, safe * 0.78, safe + 26, Math.min(panelW - safe * 1.2, 210), readable(brand.primary, "#FFFFFF"))}
    ${microLabel(campaign.badge || "Brief structuré", safe * 0.78, c.h * 0.23, readable(brand.primary, "#FFFFFF"), brand.accent)}
    ${text(offerText, safe * 0.78, baseline(c.h * 0.29, offerText), readable(brand.primary, "#FFFFFF"), 600, fontFamily(brand))}
    ${targetChip(campaign, safe * 0.78, c.h - safe - 44, Math.max(140, panelW - safe * 1.2), brand.accent, readable(brand.accent, "#11151D"))}
    ${microLabel(campaign.objective === "sell" ? "Offre" : "Campagne", lightX, titleY - 58, ink, brand.accent)}
    ${text(title, lightX, baseline(titleY, title), ink, 900, fontFamily(brand, true))}
    ${text(sub, lightX, baseline(subY, sub), ink, 540, fontFamily(brand))}
    ${benefitRail(campaign, lightX, Math.min(c.h - safe - 150, subY + sub.height + 68), lightW, ink, brand.accent)}
    ${cta(campaign.cta, lightX, c.h - safe - 62, Math.min(218, lightW * 0.55), 54, brand.primary, readable(brand.primary, "#FFFFFF"), true)}
    ${legal(campaign, lightX + Math.min(242, lightW * 0.58), c.h - safe - 24, Math.max(120, lightW - Math.min(242, lightW * 0.58)), ink)}`;
  return candidate(0, "editorial-duotone", body, [title, sub, offerText], format, 0.42, 0.03);
}

function editorialCover(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = "#FFFFFF";
  const titleW = c.landscape ? c.w * 0.48 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.29, Math.min(108, c.w * 0.105), 29);
  const sub = subFit(campaign, titleW, c.h * 0.15, Math.min(27, c.w * 0.028), 15);
  const background = campaign.assetDataUrl
    ? `${asset(campaign, 0, 0, c.w, c.h, 0, "editorial-cover-asset")}<rect width="${c.w}" height="${c.h}" fill="url(#creative-vignette)"/>`
    : `<rect width="${c.w}" height="${c.h}" fill="url(#creative-dark)"/><rect x="${c.w * 0.57}" y="${c.h * 0.08}" width="${c.w * 0.36}" height="${c.h * 0.62}" rx="42" fill="${brand.accent}" opacity="0.2" transform="rotate(5 ${c.w * 0.75} ${c.h * 0.39})"/><rect x="${c.w * 0.63}" y="${c.h * 0.14}" width="${c.w * 0.23}" height="${c.h * 0.52}" rx="34" fill="#FFFFFF" opacity="0.07" transform="rotate(-6 ${c.w * 0.75} ${c.h * 0.4})"/><circle cx="${c.w * 0.8}" cy="${c.h * 0.25}" r="${Math.min(c.w, c.h) * 0.12}" fill="${brand.accent}" opacity="0.34"/>`;
  const y = c.landscape ? c.h * 0.22 : c.h * 0.45;
  const body = `${trendDefs(brand)}${background}
    ${brandLockup(brand, safe, safe + 28, Math.min(230, c.w * 0.24), ink)}
    ${targetChip(campaign, safe, safe + 70, Math.min(340, titleW), "#FFFFFF", "#10131A")}
    ${microLabel(campaign.badge || "Editorial premium", safe, y - 54, ink, brand.accent)}
    ${text(title, safe, baseline(y, title), ink, 900, fontFamily(brand, true))}
    ${text(sub, safe, baseline(y + title.height + 42, sub), ink, 540, fontFamily(brand))}
    <rect x="${safe}" y="${c.h - safe - 118}" width="${c.w - safe * 2}" height="1" fill="#FFFFFF" opacity="0.24"/>
    ${cta(campaign.cta, safe, c.h - safe - 78, Math.min(220, titleW * 0.48), 54, brand.accent, readable(brand.accent, "#10131A"), true)}
    ${benefitRail(campaign, safe + Math.min(246, titleW * 0.52), c.h - safe - 84, Math.max(180, c.w - safe * 2 - Math.min(246, titleW * 0.52)), "#FFFFFF", brand.accent)}`;
  return candidate(1, "editorial-cover", body, [title, sub], format, campaign.assetDataUrl ? 0.62 : 0.46, 0.03);
}

function editorialTypographic(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const blockW = c.landscape ? c.w * 0.4 : c.w * 0.38;
  const textX = safe;
  const textW = c.w - blockW - safe * 2.2;
  const title = titleFit(campaign, textW, c.h * 0.34, Math.min(108, textW * 0.19), 29);
  const sub = subFit(campaign, textW, c.h * 0.16, Math.min(27, textW * 0.05), 15);
  const offerText = offerFit(campaign, blockW - safe * 0.8, c.h * 0.22, Math.min(28, blockW * 0.07));
  const titleY = c.landscape ? c.h * 0.25 : c.h * 0.27;
  const panelX = c.w - blockW;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#creative-grain)"/>
    <rect x="${panelX}" y="0" width="${blockW}" height="${c.h}" fill="${brand.primary}"/>
    <circle cx="${panelX + blockW * 0.72}" cy="${c.h * 0.22}" r="${Math.min(blockW, c.h) * 0.25}" fill="${brand.accent}" opacity="0.78"/>
    <rect x="${panelX + blockW * 0.12}" y="${c.h * 0.58}" width="${blockW * 0.76}" height="${c.h * 0.24}" rx="30" fill="#FFFFFF" opacity="0.08"/>
    ${brandLockup(brand, textX, safe + 26, Math.min(220, textW * 0.42), ink)}
    ${microLabel(campaign.badge || "Direction éditoriale", textX, titleY - 54, ink, brand.accent)}
    ${text(title, textX, baseline(titleY, title), ink, 900, fontFamily(brand, true))}
    ${text(sub, textX, baseline(titleY + title.height + 46, sub), ink, 540, fontFamily(brand))}
    ${benefitRail(campaign, textX, Math.min(c.h - safe - 154, titleY + title.height + sub.height + 86), textW, ink, brand.accent)}
    ${cta(campaign.cta, textX, c.h - safe - 62, Math.min(220, textW * 0.5), 54, brand.primary, readable(brand.primary, "#FFFFFF"), true)}
    ${microLabel("Pour", panelX + blockW * 0.12, c.h * 0.48, "#FFFFFF", brand.accent)}
    ${targetChip(campaign, panelX + blockW * 0.12, c.h * 0.51, blockW * 0.76, "#FFFFFF", "#11151D")}
    ${text(offerText, panelX + blockW * 0.12, baseline(c.h * 0.64, offerText), "#FFFFFF", 600, fontFamily(brand))}`;
  return candidate(2, "editorial-architect", body, [title, sub, offerText], format, 0.44, 0.02);
}

export function editorialCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [editorialSplit(campaign, brand, format), editorialCover(campaign, brand, format), editorialTypographic(campaign, brand, format)];
}

function impactDiagonal(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const titleW = c.landscape ? c.w * 0.58 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.34, Math.min(122, c.w * 0.115), 30);
  const sub = subFit(campaign, titleW * 0.9, c.h * 0.16, Math.min(27, c.w * 0.029), 15);
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#0A0D14"/>
    <polygon points="${c.w * 0.58},0 ${c.w},0 ${c.w},${c.h * 0.56} ${c.w * 0.42},${c.h}" fill="${brand.accent}"/>
    <polygon points="${c.w * 0.72},0 ${c.w},0 ${c.w},${c.h * 0.38} ${c.w * 0.56},${c.h * 0.78}" fill="#FFFFFF" opacity="0.13"/>
    <rect x="0" y="0" width="${c.w}" height="${c.h}" fill="url(#creative-grain)"/>
    ${campaign.assetDataUrl ? richAsset(campaign, brand, c.w * 0.65, c.h * 0.18, c.w * 0.27, c.h * 0.42, "impact-diagonal-asset", 28) : ""}
    ${brandLockup(brand, safe, safe + 28, Math.min(220, titleW * 0.38), "#FFFFFF")}
    ${microLabel(campaign.badge || campaign.target, safe, c.h * 0.28, "#FFFFFF", brand.accent)}
    ${text(title, safe, baseline(c.h * 0.34, title), "#FFFFFF", 930, fontFamily(brand))}
    ${text(sub, safe, baseline(c.h * 0.34 + title.height + 42, sub), "#FFFFFF", 540, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, titleW * 0.48), 56, "#FFFFFF", "#0A0D14", true)}
    ${targetChip(campaign, c.w - safe - Math.min(310, c.w * 0.3), c.h - safe - 64, Math.min(310, c.w * 0.3), "#0A0D14", "#FFFFFF")}`;
  return candidate(0, "impact-signal", body, [title, sub], format, 0.51, 0.02);
}

function impactPoster(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const width = c.w - safe * 2;
  const title = titleFit(campaign, width, c.h * 0.35, Math.min(132, c.w * 0.125), 30);
  const sub = subFit(campaign, width * 0.78, c.h * 0.15, Math.min(28, c.w * 0.03), 15);
  const y = c.landscape ? c.h * 0.24 : c.h * 0.3;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.primary}"/>
    <rect x="${c.w * 0.6}" y="0" width="${c.w * 0.4}" height="${c.h}" fill="${brand.accent}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#creative-grid)" opacity="0.55"/>
    <text x="${c.w * 0.94}" y="${c.h * 0.2}" fill="#FFFFFF" opacity="0.16" font-size="${Math.min(c.w, c.h) * 0.2}" font-weight="950" text-anchor="end" font-family="Inter,Arial,sans-serif">${esc(clean(campaign.objective, 10).toUpperCase())}</text>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, width * 0.26), readable(brand.primary, "#FFFFFF"))}
    ${targetChip(campaign, safe, safe + 70, Math.min(340, width * 0.45), "#FFFFFF", "#10131A")}
    ${text(title, safe, baseline(y, title), "#FFFFFF", 950, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 46, sub), "#FFFFFF", 560, fontFamily(brand))}
    ${benefitRail(campaign, safe, c.h - safe - 154, width, "#FFFFFF", brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, width * 0.28), 56, "#FFFFFF", brand.primary, true)}`;
  return candidate(1, "impact-poster", body, [title, sub], format, 0.5, 0.02);
}

function impactSplitBlast(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const heroW = c.landscape ? c.w * 0.38 : c.w - safe * 2;
  const heroH = c.landscape ? c.h - safe * 2 : c.h * 0.31;
  const heroX = c.landscape ? c.w - safe - heroW : safe;
  const heroY = safe;
  const textW = c.landscape ? c.w * 0.48 : c.w - safe * 2;
  const textY = c.landscape ? c.h * 0.24 : heroY + heroH + 58;
  const title = titleFit(campaign, textW, c.h * 0.31, Math.min(112, textW * 0.19), 28);
  const sub = subFit(campaign, textW, c.h * 0.14, Math.min(26, textW * 0.05), 15);
  const visual = campaign.assetDataUrl
    ? richAsset(campaign, brand, heroX, heroY, heroW, heroH, "impact-split-asset", 26)
    : `<g><rect x="${heroX}" y="${heroY}" width="${heroW}" height="${heroH}" rx="26" fill="${brand.accent}"/><rect x="${heroX + heroW * 0.12}" y="${heroY + heroH * 0.16}" width="${heroW * 0.76}" height="${heroH * 0.68}" rx="22" fill="#FFFFFF" opacity="0.14"/>${priceBlock(campaign, heroX + heroW * 0.16, heroY + heroH * 0.28, heroW * 0.68, Math.min(160, heroH * 0.42), "#0A0D14", "#FFFFFF", brand.accent)}</g>`;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#0B0E15"/>
    <rect x="0" y="0" width="${c.w * 0.18}" height="${c.h}" fill="${brand.primary}" opacity="0.9"/>
    ${visual}
    ${brandLockup(brand, safe, safe + 28, Math.min(220, textW * 0.42), "#FFFFFF")}
    ${microLabel(campaign.badge || "Campaign bold", safe, textY - 54, "#FFFFFF", brand.accent)}
    ${text(title, safe, baseline(textY, title), "#FFFFFF", 930, fontFamily(brand))}
    ${text(sub, safe, baseline(textY + title.height + 42, sub), "#FFFFFF", 540, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, textW * 0.5), 56, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(2, "impact-split-blast", body, [title, sub], format, campaign.assetDataUrl ? 0.55 : 0.4, 0.02);
}

export function impactCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [impactDiagonal(campaign, brand, format), impactPoster(campaign, brand, format), impactSplitBlast(campaign, brand, format)];
}

function spotlightCenter(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const heroW = c.landscape ? c.w * 0.42 : c.w * 0.72;
  const heroH = c.landscape ? c.h * 0.68 : c.h * 0.38;
  const heroX = c.landscape ? c.w - safe - heroW : (c.w - heroW) / 2;
  const heroY = c.landscape ? c.h * 0.16 : c.h * 0.15;
  const textW = c.landscape ? c.w * 0.43 : c.w - safe * 2;
  const textY = c.landscape ? c.h * 0.28 : heroY + heroH + 56;
  const title = titleFit(campaign, textW, c.h * 0.28, Math.min(100, textW * 0.17), 27);
  const sub = subFit(campaign, textW, c.h * 0.14, Math.min(25, textW * 0.05), 14);
  const visual = campaign.assetDataUrl
    ? `<g><ellipse cx="${heroX + heroW / 2}" cy="${heroY + heroH * 0.93}" rx="${heroW * 0.34}" ry="${heroH * 0.08}" fill="${brand.primary}" opacity="0.14" filter="url(#pro-blur)"/>${richAsset(campaign, brand, heroX, heroY, heroW, heroH, "spotlight-center-asset", 34)}</g>`
    : `<g filter="url(#pro-soft-shadow)"><rect x="${heroX}" y="${heroY}" width="${heroW}" height="${heroH}" rx="36" fill="${brand.primary}"/><rect x="${heroX + heroW * 0.08}" y="${heroY + heroH * 0.1}" width="${heroW * 0.84}" height="${heroH * 0.8}" rx="28" fill="#FFFFFF" opacity="0.08"/>${priceBlock(campaign, heroX + heroW * 0.14, heroY + heroH * 0.23, heroW * 0.72, Math.min(190, heroH * 0.42), brand.accent, readable(brand.accent, "#10131A"), "#FFFFFF")}${microLabel("Offre", heroX + heroW * 0.14, heroY + heroH * 0.76, "#FFFFFF", brand.accent)}</g>`;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#creative-grain)"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), ink)}
    ${visual}
    ${microLabel(campaign.badge || "Product / Offer", safe, textY - 50, ink, brand.accent)}
    ${text(title, safe, baseline(textY, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(textY + title.height + 40, sub), ink, 540, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 62, Math.min(220, textW * 0.5), 54, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(0, "spotlight-center-stage", body, [title, sub], format, campaign.assetDataUrl ? 0.62 : 0.46, 0.03);
}

function spotlightSplit(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const splitX = c.landscape ? c.w * 0.52 : c.w * 0.46;
  const titleW = c.landscape ? c.w * 0.42 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.26, Math.min(102, titleW * 0.18), 27);
  const sub = subFit(campaign, titleW, c.h * 0.14, Math.min(25, titleW * 0.05), 14);
  const heroX = c.landscape ? splitX : safe;
  const heroY = c.landscape ? safe : c.h * 0.5;
  const heroW = c.landscape ? c.w - heroX - safe : c.w - safe * 2;
  const heroH = c.landscape ? c.h - safe * 2 : c.h - heroY - safe;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="${splitX}" y="0" width="${c.w - splitX}" height="${c.h}" fill="${brand.primary}" opacity="0.055"/>
    ${campaign.assetDataUrl ? richAsset(campaign, brand, heroX, heroY, heroW, heroH, "spotlight-split-asset", 30) : `${priceBlock(campaign, heroX, heroY, heroW, Math.min(220, heroH * 0.38), brand.primary, readable(brand.primary, "#FFFFFF"), brand.accent)}${offer(campaign, brand, heroX, heroY + Math.min(246, heroH * 0.42), heroW, Math.min(150, heroH * 0.3))}`}
    ${brandLockup(brand, safe, safe + 28, Math.min(220, titleW * 0.44), ink)}
    ${targetChip(campaign, safe, safe + 72, Math.min(330, titleW), brand.primary, readable(brand.primary, "#FFFFFF"))}
    ${microLabel(campaign.badge || "Focus", safe, c.h * 0.23, ink, brand.accent)}
    ${text(title, safe, baseline(c.h * 0.28, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(c.h * 0.28 + title.height + 40, sub), ink, 540, fontFamily(brand))}
    ${benefits(campaign, brand, safe, Math.min(c.h - safe - 174, c.h * 0.28 + title.height + sub.height + 92), titleW, 86)}
    ${cta(campaign.cta, safe, c.h - safe - 62, Math.min(220, titleW * 0.5), 54, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "spotlight-split-hero", body, [title, sub], format, campaign.assetDataUrl ? 0.58 : 0.44, 0.03);
}

function spotlightFullBleed(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const titleW = c.landscape ? c.w * 0.5 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.28, Math.min(108, c.w * 0.102), 28);
  const sub = subFit(campaign, titleW, c.h * 0.14, Math.min(26, c.w * 0.028), 15);
  const background = campaign.assetDataUrl
    ? `${asset(campaign, 0, 0, c.w, c.h, 0, "spotlight-full-asset")}<rect width="${c.w}" height="${c.h}" fill="url(#creative-vignette)"/>`
    : `<rect width="${c.w}" height="${c.h}" fill="url(#creative-dark)"/><circle cx="${c.w * 0.76}" cy="${c.h * 0.34}" r="${Math.min(c.w, c.h) * 0.23}" fill="${brand.accent}" opacity="0.28"/><rect x="${c.w * 0.62}" y="${c.h * 0.14}" width="${c.w * 0.26}" height="${c.h * 0.42}" rx="34" fill="#FFFFFF" opacity="0.08"/>`;
  const y = c.landscape ? c.h * 0.25 : c.h * 0.5;
  const body = `${trendDefs(brand)}${background}
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), "#FFFFFF")}
    ${badge(campaign, safe, y - 54, Math.min(220, titleW), brand.accent, readable(brand.accent, "#10131A"))}
    ${text(title, safe, baseline(y, title), "#FFFFFF", 930, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 42, sub), "#FFFFFF", 540, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(220, titleW * 0.48), 56, "#FFFFFF", "#11151D", true)}
    ${priceBlock(campaign, c.w - safe - Math.min(250, c.w * 0.24), c.h - safe - 136, Math.min(250, c.w * 0.24), 116, brand.accent, readable(brand.accent, "#10131A"), "#FFFFFF")}`;
  return candidate(2, "spotlight-full-bleed", body, [title, sub], format, campaign.assetDataUrl ? 0.68 : 0.46, 0.03);
}

export function spotlightCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [spotlightCenter(campaign, brand, format), spotlightSplit(campaign, brand, format), spotlightFullBleed(campaign, brand, format)];
}

function retailOfferHero(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const title = titleFit(campaign, c.w - safe * 2, c.h * 0.23, Math.min(92, c.w * 0.088), 25);
  const sub = subFit(campaign, c.w - safe * 2, c.h * 0.1, Math.min(23, c.w * 0.024), 14);
  const priceW = Math.min(c.w - safe * 2, c.landscape ? c.w * 0.34 : c.w * 0.58);
  const priceY = safe + 96;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="0" y="0" width="${c.w}" height="${Math.min(c.h * 0.19, 250)}" fill="${brand.primary}"/>
    <rect x="${c.w * 0.66}" y="0" width="${c.w * 0.34}" height="${Math.min(c.h * 0.19, 250)}" fill="${brand.accent}"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), readable(brand.primary, "#FFFFFF"))}
    ${badge(campaign, c.w - safe - Math.min(210, c.w * 0.22), safe, Math.min(210, c.w * 0.22), "#FFFFFF", "#10131A")}
    ${priceBlock(campaign, safe, priceY, priceW, Math.min(200, c.h * 0.17), brand.accent, readable(brand.accent, "#10131A"), brand.primary)}
    ${text(title, safe, baseline(priceY + Math.min(238, c.h * 0.21), title), ink, 930, fontFamily(brand))}
    ${text(sub, safe, baseline(priceY + Math.min(260, c.h * 0.22) + title.height, sub), ink, 540, fontFamily(brand))}
    ${benefitRail(campaign, safe, c.h - safe - 154, c.w - safe * 2, ink, brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(240, c.w * 0.3), 56, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(0, "retail-offer-hero", body, [title, sub], format, 0.48, 0.02);
}

function retailShelf(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const title = titleFit(campaign, c.w - safe * 2, c.h * 0.22, Math.min(88, c.w * 0.084), 25);
  const sub = subFit(campaign, c.w - safe * 2, c.h * 0.1, Math.min(23, c.w * 0.024), 14);
  const heroY = c.h * 0.38;
  const heroH = c.h * 0.28;
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#creative-grain)"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), ink)}
    ${microLabel(campaign.badge || "Offre claire", safe, safe + 104, ink, brand.accent)}
    ${text(title, safe, baseline(safe + 150, title), ink, 930, fontFamily(brand))}
    ${text(sub, safe, baseline(safe + 174 + title.height, sub), ink, 540, fontFamily(brand))}
    ${campaign.assetDataUrl ? richAsset(campaign, brand, safe, heroY, c.w - safe * 2, heroH, "retail-shelf-asset", 28) : `<g><rect x="${safe}" y="${heroY}" width="${c.w - safe * 2}" height="${heroH}" rx="28" fill="${brand.primary}"/>${priceBlock(campaign, safe + 24, heroY + 24, Math.min(300, (c.w - safe * 2) * 0.38), heroH - 48, brand.accent, readable(brand.accent, "#10131A"), "#FFFFFF")}${offer(campaign, brand, safe + Math.min(340, (c.w - safe * 2) * 0.42), heroY + 24, Math.max(180, c.w - safe * 2 - Math.min(364, (c.w - safe * 2) * 0.44)), heroH - 48, true)}</g>`}
    ${targetChip(campaign, safe, c.h - safe - 124, Math.min(330, c.w * 0.34), brand.primary, readable(brand.primary, "#FFFFFF"))}
    ${cta(campaign.cta, c.w - safe - Math.min(240, c.w * 0.28), c.h - safe - 124, Math.min(240, c.w * 0.28), 56, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "retail-shelf", body, [title, sub], format, campaign.assetDataUrl ? 0.54 : 0.48, 0.02);
}

function retailFlyer(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const titleW = c.landscape ? c.w * 0.54 : c.w - safe * 2;
  const title = titleFit(campaign, titleW, c.h * 0.24, Math.min(94, c.w * 0.09), 25);
  const sub = subFit(campaign, titleW, c.h * 0.11, Math.min(23, c.w * 0.024), 14);
  const body = `${trendDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.primary}"/>
    <circle cx="${c.w * 0.86}" cy="${c.h * 0.16}" r="${Math.min(c.w, c.h) * 0.22}" fill="${brand.accent}"/>
    <circle cx="${c.w * 0.86}" cy="${c.h * 0.16}" r="${Math.min(c.w, c.h) * 0.13}" fill="#FFFFFF" opacity="0.16"/>
    <rect x="${safe}" y="${c.h * 0.44}" width="${c.w - safe * 2}" height="${c.h * 0.38}" rx="34" fill="${brand.background}"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), readable(brand.primary, "#FFFFFF"))}
    ${badge(campaign, safe, safe + 70, Math.min(220, titleW), brand.accent, readable(brand.accent, "#10131A"))}
    ${text(title, safe, baseline(c.h * 0.2, title), "#FFFFFF", 930, fontFamily(brand))}
    ${priceBlock(campaign, safe, c.h * 0.47, Math.min(330, c.w * 0.36), Math.min(190, c.h * 0.14), brand.accent, readable(brand.accent, "#10131A"), brand.primary)}
    ${text(sub, safe + Math.min(360, c.w * 0.39), baseline(c.h * 0.5, sub), readable(brand.background, brand.primary), 540, fontFamily(brand))}
    ${benefitRail(campaign, safe, c.h * 0.68, c.w - safe * 2, readable(brand.background, brand.primary), brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(240, c.w * 0.3), 56, "#FFFFFF", brand.primary, true)}`;
  return candidate(2, "retail-flyer", body, [title, sub], format, 0.5, 0.02);
}

export function retailCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [retailOfferHero(campaign, brand, format), retailShelf(campaign, brand, format), retailFlyer(campaign, brand, format)];
}
