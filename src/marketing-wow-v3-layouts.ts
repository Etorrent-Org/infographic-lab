import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  asset,
  badge,
  baseline,
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
  readable,
  richAsset,
  text,
  type RenderCandidate,
  type VariantIndex,
} from "./marketing-wow-v2-core";

function creativeDefs(brand: BrandProfile) {
  return `${defs(brand)}<defs>
    <pattern id="v3-paper" width="42" height="42" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="8" r="1" fill="${brand.primary}" opacity="0.035"/>
      <circle cx="30" cy="26" r="0.8" fill="${brand.accent}" opacity="0.06"/>
    </pattern>
    <pattern id="v3-grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="${brand.primary}" stroke-width="1" opacity="0.045"/>
    </pattern>
    <linearGradient id="v3-dark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="58%" stop-color="#121927"/>
      <stop offset="100%" stop-color="${brand.primary}"/>
    </linearGradient>
    <linearGradient id="v3-brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.accent}"/>
      <stop offset="100%" stop-color="${brand.primary}"/>
    </linearGradient>
    <linearGradient id="v3-vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#080B12" stop-opacity="0.08"/>
      <stop offset="52%" stop-color="#080B12" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#080B12" stop-opacity="0.9"/>
    </linearGradient>
  </defs>`;
}

function headlineFit(campaign: MarketingCampaign, width: number, height: number, maxSize: number, minSize = 28) {
  return fitText(clean(campaign.headline, 260), width, height, maxSize, minSize, 850, 1.01);
}

function subFit(campaign: MarketingCampaign, width: number, height: number, maxSize: number, minSize = 15) {
  return fitText(clean(campaign.subheadline, 420), width, height, maxSize, minSize, 520, 1.18);
}

function offerFit(campaign: MarketingCampaign, width: number, height: number, maxSize = 24) {
  return fitText(clean(campaign.offer, 480), width, height, maxSize, 13, 620, 1.15);
}

function eyebrow(label: string, x: number, y: number, color: string, accent: string) {
  const value = clean(label, 72).toUpperCase();
  if (!value) return "";
  return `<g><rect x="${x}" y="${y - 14}" width="28" height="5" rx="2.5" fill="${accent}"/><text x="${x + 42}" y="${y}" fill="${color}" font-size="13" font-weight="800" font-family="Inter,Arial,sans-serif" letter-spacing="1.8">${esc(value)}</text></g>`;
}

function smallCaps(value: string, x: number, y: number, color: string, anchor: "start" | "end" = "start") {
  const cleanValue = clean(value, 84).toUpperCase();
  if (!cleanValue) return "";
  return `<text x="${x}" y="${y}" fill="${color}" opacity="0.68" font-size="12" font-weight="760" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif" letter-spacing="1.5">${esc(cleanValue)}</text>`;
}

function targetPill(campaign: MarketingCampaign, x: number, y: number, maxWidth: number, bg: string, fg: string) {
  const value = clean(campaign.target, 90);
  if (!value) return "";
  const fit = fitText(value, maxWidth - 34, 26, 14, 10, 720, 1);
  const line = fit.lines[0] ?? value;
  const width = Math.min(maxWidth, Math.max(148, Math.min(maxWidth, line.length * fit.size * 0.58 + 38)));
  return `<g><rect x="${x}" y="${y}" width="${width}" height="38" rx="19" fill="${bg}"/><text x="${x + 19}" y="${y + 24}" fill="${fg}" font-size="${fit.size}" font-weight="720" font-family="Inter,Arial,sans-serif">${esc(line)}</text></g>`;
}

function benefitStack(campaign: MarketingCampaign, x: number, y: number, width: number, rowHeight: number, fg: string, accent: string, dark = false) {
  const items = campaign.benefits.map((item) => clean(item, 100)).filter(Boolean).slice(0, 3);
  return items.map((item, index) => {
    const top = y + index * (rowHeight + 12);
    const fit = fitText(item, width - 72, rowHeight - 20, Math.min(18, width * 0.045), 11, 700, 1.1);
    return `<g>
      <rect x="${x}" y="${top}" width="${width}" height="${rowHeight}" rx="18" fill="${dark ? "#FFFFFF" : fg}" opacity="${dark ? 0.09 : 0.055}"/>
      <circle cx="${x + 24}" cy="${top + rowHeight / 2}" r="11" fill="${accent}"/>
      <text x="${x + 24}" y="${top + rowHeight / 2 + 4}" text-anchor="middle" fill="${readable(accent, "#10131A")}" font-size="10" font-weight="900" font-family="Inter,Arial,sans-serif">${index + 1}</text>
      ${text(fit, x + 48, baseline(top + 13, fit), fg, 700, "Inter,Arial,sans-serif")}
    </g>`;
  }).join("");
}

function benefitRail(campaign: MarketingCampaign, x: number, y: number, width: number, height: number, fg: string, accent: string, dark = false) {
  const items = campaign.benefits.map((item) => clean(item, 90)).filter(Boolean).slice(0, 3);
  if (!items.length) return "";
  const gap = 14;
  const cell = (width - gap * (items.length - 1)) / items.length;
  return items.map((item, index) => {
    const bx = x + index * (cell + gap);
    const fit = fitText(item, cell - 30, height - 28, Math.min(17, cell * 0.055), 10, 720, 1.08);
    return `<g><rect x="${bx}" y="${y}" width="${cell}" height="${height}" rx="18" fill="${dark ? "#FFFFFF" : fg}" opacity="${dark ? 0.09 : 0.055}"/><rect x="${bx + 15}" y="${y + 14}" width="24" height="5" rx="2.5" fill="${accent}"/>${text(fit, bx + 15, baseline(y + 32, fit), fg, 720, "Inter,Arial,sans-serif")}</g>`;
  }).join("");
}

function offerCard(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, height: number, dark = false) {
  const fg = dark ? "#FFFFFF" : readable(brand.background, brand.primary);
  const fit = offerFit(campaign, width - 44, height - 44, Math.min(28, width * 0.06));
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="${dark ? "#FFFFFF" : brand.primary}" opacity="${dark ? 0.09 : 0.055}"/>
    <rect x="${x + 18}" y="${y + 18}" width="34" height="6" rx="3" fill="${brand.accent}"/>
    ${text(fit, x + 20, baseline(y + 44, fit), fg, 620, fontFamily(brand))}
  </g>`;
}

function priceCard(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, width: number, height: number, dark = false) {
  const value = clean(campaign.price ?? campaign.badge ?? "", 54);
  if (!value) return offerCard(campaign, brand, x, y, width, height, dark);
  const bg = dark ? brand.accent : brand.primary;
  const fg = readable(bg, "#FFFFFF");
  const fit = fitText(value, width - 36, height * 0.62, Math.min(76, height * 0.55), 24, 950, 0.95);
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="26" fill="${bg}"/>${smallCaps(campaign.badge || "Offre", x + 22, y + 30, fg)}${text(fit, x + 22, baseline(y + 52, fit), fg, 950, "Inter,Arial,sans-serif")}</g>`;
}

function candidate(variant: VariantIndex, label: string, body: string, fits: ReturnType<typeof fitText>[], format: MarketingFormat, heroRatio: number, deadZone: number, ctaVisible = true): RenderCandidate {
  return makeCandidate(variant, label, body, fits, canvasOf(format), heroRatio, deadZone, ctaVisible);
}

function editorialStatement(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const textW = c.landscape ? c.w * 0.52 : c.w * 0.6;
  const sideW = c.w - textW - safe * 2.2;
  const title = headlineFit(campaign, textW, c.h * 0.29, Math.min(c.landscape ? 96 : 78, textW * 0.135), 30);
  const sub = subFit(campaign, textW, c.h * 0.13, Math.min(26, textW * 0.043), 15);
  const titleY = c.landscape ? c.h * 0.25 : c.h * 0.23;
  const sideX = safe + textW + safe * 0.7;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-paper)"/>
    <rect x="${sideX - 24}" y="0" width="${c.w - sideX + 24}" height="${c.h}" fill="${brand.primary}"/>
    <rect x="${sideX - 24}" y="0" width="10" height="${c.h}" fill="${brand.accent}"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(230, textW * 0.42), ink)}
    ${targetPill(campaign, safe, safe + 74, Math.min(360, textW), brand.primary, readable(brand.primary, "#FFFFFF"))}
    ${eyebrow(campaign.badge || "Direction éditoriale", safe, titleY - 52, ink, brand.accent)}
    ${text(title, safe, baseline(titleY, title), ink, 850, fontFamily(brand, true))}
    ${text(sub, safe, baseline(titleY + title.height + 40, sub), ink, 520, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(220, textW * 0.42), 54, brand.accent, readable(brand.accent, "#10131A"), true)}
    ${smallCaps(campaign.objective, sideX, safe + 26, "#FFFFFF")}
    ${offerCard(campaign, brand, sideX, safe + 62, sideW, Math.min(168, c.h * 0.15), true)}
    ${benefitStack(campaign, sideX, safe + Math.min(250, c.h * 0.22), sideW, Math.min(82, c.h * 0.075), "#FFFFFF", brand.accent, true)}
    ${legal(campaign, sideX, c.h - safe * 0.55, sideW, "#FFFFFF")}`;
  return candidate(0, "editorial-statement", body, [title, sub], format, 0.44, 0.025);
}

function editorialCover(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const titleW = c.landscape ? c.w * 0.52 : c.w - safe * 2;
  const title = headlineFit(campaign, titleW, c.h * 0.28, Math.min(92, c.w * 0.085), 29);
  const sub = subFit(campaign, titleW * 0.88, c.h * 0.13, Math.min(26, c.w * 0.024), 15);
  const background = campaign.assetDataUrl
    ? `${asset(campaign, 0, 0, c.w, c.h, 0, "editorial-cover-v3")}<rect width="${c.w}" height="${c.h}" fill="url(#v3-vignette)"/>`
    : `<rect width="${c.w}" height="${c.h}" fill="url(#v3-dark)"/><rect x="${c.w * 0.58}" y="0" width="${c.w * 0.42}" height="${c.h}" fill="${brand.accent}" opacity="0.16"/><rect x="${c.w * 0.64}" y="${c.h * 0.12}" width="${c.w * 0.24}" height="${c.h * 0.62}" rx="34" fill="#FFFFFF" opacity="0.07"/>`;
  const y = c.landscape ? c.h * 0.24 : c.h * 0.42;
  const body = `${creativeDefs(brand)}${background}
    ${brandLockup(brand, safe, safe + 28, Math.min(230, c.w * 0.24), "#FFFFFF")}
    ${targetPill(campaign, safe, safe + 76, Math.min(360, titleW), "#FFFFFF", "#10131A")}
    ${eyebrow(campaign.badge || "Editorial premium", safe, y - 52, "#FFFFFF", brand.accent)}
    ${text(title, safe, baseline(y, title), "#FFFFFF", 880, fontFamily(brand, true))}
    ${text(sub, safe, baseline(y + title.height + 38, sub), "#FFFFFF", 520, fontFamily(brand))}
    ${benefitRail(campaign, safe, c.h - safe - 158, c.w - safe * 2, 76, "#FFFFFF", brand.accent, true)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(220, titleW * 0.42), 54, brand.accent, readable(brand.accent, "#10131A"), true)}`;
  return candidate(1, "editorial-cover-v3", body, [title, sub], format, campaign.assetDataUrl ? 0.66 : 0.5, 0.02);
}

function editorialModular(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const width = c.w - safe * 2;
  const titleW = c.landscape ? width * 0.58 : width * 0.82;
  const title = headlineFit(campaign, titleW, c.h * 0.27, Math.min(c.landscape ? 96 : 74, c.w * 0.074), 28);
  const sub = subFit(campaign, titleW, c.h * 0.12, Math.min(25, c.w * 0.024), 15);
  const titleY = safe + Math.max(128, c.h * 0.13);
  const cardsY = Math.min(c.h - safe - 310, titleY + title.height + sub.height + 94);
  const cardGap = 18;
  const cardW = (width - cardGap * 2) / 3;
  const benefitItems = campaign.benefits.map((item) => clean(item, 90)).filter(Boolean).slice(0, 3);
  const benefitCards = benefitItems.map((item, index) => {
    const x = safe + index * (cardW + cardGap);
    const fit = fitText(item, cardW - 34, 80, Math.min(19, cardW * 0.06), 11, 760, 1.08);
    return `<g><rect x="${x}" y="${cardsY}" width="${cardW}" height="132" rx="22" fill="${index === 0 ? brand.primary : ink}" opacity="${index === 0 ? 1 : 0.055}"/><text x="${x + 18}" y="${cardsY + 28}" fill="${index === 0 ? readable(brand.primary, "#FFFFFF") : ink}" opacity="${index === 0 ? 0.78 : 0.56}" font-size="11" font-weight="800" font-family="Inter,Arial,sans-serif" letter-spacing="1.5">0${index + 1}</text>${text(fit, x + 18, baseline(cardsY + 52, fit), index === 0 ? readable(brand.primary, "#FFFFFF") : ink, 760, "Inter,Arial,sans-serif")}</g>`;
  }).join("");
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-grid)"/>
    <rect x="0" y="0" width="${c.w}" height="12" fill="${brand.accent}"/>
    ${brandLockup(brand, safe, safe + 34, Math.min(230, c.w * 0.24), ink)}
    ${smallCaps(campaign.target, c.w - safe, safe + 28, ink, "end")}
    ${eyebrow(campaign.badge || "Message structuré", safe, titleY - 48, ink, brand.accent)}
    ${text(title, safe, baseline(titleY, title), ink, 850, fontFamily(brand, true))}
    ${text(sub, safe, baseline(titleY + title.height + 38, sub), ink, 520, fontFamily(brand))}
    ${benefitCards}
    ${offerCard(campaign, brand, safe, cardsY + 154, width * (c.landscape ? 0.58 : 0.66), 118)}
    ${cta(campaign.cta, c.w - safe - Math.min(230, width * 0.26), cardsY + 178, Math.min(230, width * 0.26), 56, brand.primary, readable(brand.primary, "#FFFFFF"), true)}
    ${legal(campaign, safe, c.h - safe * 0.5, width, ink)}`;
  return candidate(2, "editorial-modular", body, [title, sub], format, 0.42, 0.018);
}

export function editorialCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [editorialStatement(campaign, brand, format), editorialCover(campaign, brand, format), editorialModular(campaign, brand, format)];
}

function impactSignal(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const width = c.w - safe * 2;
  const title = headlineFit(campaign, width * (c.landscape ? 0.63 : 0.8), c.h * 0.3, Math.min(104, c.w * 0.095), 30);
  const sub = subFit(campaign, width * 0.72, c.h * 0.12, Math.min(25, c.w * 0.025), 15);
  const y = c.landscape ? c.h * 0.24 : c.h * 0.28;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#090D15"/>
    <rect x="${c.w * 0.64}" y="0" width="${c.w * 0.36}" height="${c.h}" fill="${brand.accent}"/>
    <polygon points="${c.w * 0.57},0 ${c.w * 0.69},0 ${c.w * 0.51},${c.h} ${c.w * 0.39},${c.h}" fill="${brand.primary}" opacity="0.92"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, width * 0.28), "#FFFFFF")}
    ${eyebrow(campaign.badge || "Campaign bold", safe, y - 54, "#FFFFFF", brand.accent)}
    ${text(title, safe, baseline(y, title), "#FFFFFF", 900, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 40, sub), "#FFFFFF", 540, fontFamily(brand))}
    ${benefitRail(campaign, safe, c.h - safe - 154, width * 0.74, 76, "#FFFFFF", brand.accent, true)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, width * 0.28), 56, brand.accent, readable(brand.accent, "#10131A"), true)}
    ${smallCaps(campaign.target, c.w - safe, c.h - safe - 26, readable(brand.accent, "#10131A"), "end")}`;
  return candidate(0, "impact-signal-v3", body, [title, sub], format, 0.54, 0.018);
}

function impactPoster(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const width = c.w - safe * 2;
  const title = headlineFit(campaign, width, c.h * 0.29, Math.min(112, c.w * 0.1), 30);
  const sub = subFit(campaign, width * 0.74, c.h * 0.12, Math.min(25, c.w * 0.025), 15);
  const y = c.landscape ? c.h * 0.22 : c.h * 0.28;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.primary}"/>
    <rect x="0" y="${c.h * 0.72}" width="${c.w}" height="${c.h * 0.28}" fill="${brand.accent}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-grid)" opacity="0.48"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, width * 0.26), readable(brand.primary, "#FFFFFF"))}
    ${targetPill(campaign, safe, safe + 74, Math.min(350, width * 0.48), "#FFFFFF", "#10131A")}
    ${text(title, safe, baseline(y, title), "#FFFFFF", 920, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 42, sub), "#FFFFFF", 540, fontFamily(brand))}
    ${offerCard(campaign, brand, safe, c.h * 0.58, width * 0.52, 120, true)}
    ${benefitRail(campaign, safe, c.h * 0.76, width, 82, readable(brand.accent, "#10131A"), brand.primary)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, width * 0.28), 56, "#10131A", "#FFFFFF", true)}`;
  return candidate(1, "impact-poster-v3", body, [title, sub], format, 0.58, 0.015);
}

function impactGrid(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = "#FFFFFF";
  const leftW = c.landscape ? c.w * 0.55 : c.w * 0.58;
  const rightX = safe + leftW + 20;
  const rightW = c.w - rightX - safe;
  const title = headlineFit(campaign, leftW, c.h * 0.29, Math.min(98, leftW * 0.15), 29);
  const sub = subFit(campaign, leftW, c.h * 0.13, Math.min(24, leftW * 0.04), 15);
  const y = c.h * 0.24;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="#0A0F19"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-grid)" opacity="0.44"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, leftW * 0.42), ink)}
    ${eyebrow(campaign.badge || "Signal", safe, y - 50, ink, brand.accent)}
    ${text(title, safe, baseline(y, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 40, sub), ink, 540, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, leftW * 0.48), 56, brand.accent, readable(brand.accent, "#10131A"), true)}
    ${priceCard(campaign, brand, rightX, safe, rightW, Math.min(190, c.h * 0.17), true)}
    ${offerCard(campaign, brand, rightX, safe + Math.min(214, c.h * 0.19), rightW, Math.min(160, c.h * 0.14), true)}
    ${benefitStack(campaign, rightX, safe + Math.min(400, c.h * 0.36), rightW, Math.min(78, c.h * 0.07), ink, brand.accent, true)}`;
  return candidate(2, "impact-grid-v3", body, [title, sub], format, 0.5, 0.018);
}

export function impactCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [impactSignal(campaign, brand, format), impactPoster(campaign, brand, format), impactGrid(campaign, brand, format)];
}

function spotlightHero(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const heroW = c.landscape ? c.w * 0.43 : c.w * 0.72;
  const heroH = c.landscape ? c.h * 0.68 : c.h * 0.36;
  const heroX = c.landscape ? c.w - safe - heroW : (c.w - heroW) / 2;
  const heroY = c.landscape ? c.h * 0.16 : c.h * 0.13;
  const textW = c.landscape ? c.w * 0.43 : c.w - safe * 2;
  const textY = c.landscape ? c.h * 0.27 : heroY + heroH + 52;
  const title = headlineFit(campaign, textW, c.h * 0.25, Math.min(90, textW * 0.15), 27);
  const sub = subFit(campaign, textW, c.h * 0.12, Math.min(24, textW * 0.045), 14);
  const visual = campaign.assetDataUrl
    ? richAsset(campaign, brand, heroX, heroY, heroW, heroH, "spotlight-hero-v3", 30)
    : `${priceCard(campaign, brand, heroX, heroY, heroW, Math.min(200, heroH * 0.48))}${offerCard(campaign, brand, heroX, heroY + Math.min(224, heroH * 0.52), heroW, Math.min(150, heroH * 0.34))}`;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-paper)"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), ink)}
    ${visual}
    ${eyebrow(campaign.badge || "Offer spotlight", safe, textY - 48, ink, brand.accent)}
    ${text(title, safe, baseline(textY, title), ink, 880, fontFamily(brand))}
    ${text(sub, safe, baseline(textY + title.height + 38, sub), ink, 520, fontFamily(brand))}
    ${benefitRail(campaign, safe, c.h - safe - 154, textW, 76, ink, brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(220, textW * 0.48), 54, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(0, "spotlight-hero-v3", body, [title, sub], format, campaign.assetDataUrl ? 0.64 : 0.5, 0.018);
}

function spotlightSplit(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const leftW = c.landscape ? c.w * 0.48 : c.w * 0.58;
  const rightX = safe + leftW + 18;
  const rightW = c.w - rightX - safe;
  const title = headlineFit(campaign, leftW, c.h * 0.25, Math.min(92, leftW * 0.15), 27);
  const sub = subFit(campaign, leftW, c.h * 0.12, Math.min(24, leftW * 0.043), 14);
  const y = c.h * 0.24;
  const visual = campaign.assetDataUrl
    ? richAsset(campaign, brand, rightX, safe, rightW, c.h - safe * 2, "spotlight-split-v3", 28)
    : `${priceCard(campaign, brand, rightX, safe, rightW, Math.min(220, c.h * 0.2))}${offerCard(campaign, brand, rightX, safe + Math.min(244, c.h * 0.22), rightW, Math.min(170, c.h * 0.15))}${benefitStack(campaign, rightX, safe + Math.min(440, c.h * 0.39), rightW, Math.min(76, c.h * 0.067), ink, brand.accent)}`;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="${rightX - 18}" y="0" width="${c.w - rightX + 18}" height="${c.h}" fill="${brand.primary}" opacity="0.05"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, leftW * 0.42), ink)}
    ${targetPill(campaign, safe, safe + 76, Math.min(340, leftW), brand.primary, readable(brand.primary, "#FFFFFF"))}
    ${eyebrow(campaign.badge || "Focus", safe, y - 48, ink, brand.accent)}
    ${text(title, safe, baseline(y, title), ink, 880, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 38, sub), ink, 520, fontFamily(brand))}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(220, leftW * 0.48), 54, brand.accent, readable(brand.accent, "#10131A"), true)}
    ${visual}`;
  return candidate(1, "spotlight-split-v3", body, [title, sub], format, campaign.assetDataUrl ? 0.66 : 0.52, 0.016);
}

function spotlightProof(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const width = c.w - safe * 2;
  const title = headlineFit(campaign, width * (c.landscape ? 0.62 : 0.76), c.h * 0.24, Math.min(86, c.w * 0.08), 27);
  const sub = subFit(campaign, width * 0.7, c.h * 0.11, Math.min(24, c.w * 0.023), 14);
  const y = safe + Math.max(124, c.h * 0.13);
  const panelY = Math.min(c.h - safe - 340, y + title.height + sub.height + 88);
  const half = (width - 18) / 2;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-grid)"/>
    ${brandLockup(brand, safe, safe + 30, Math.min(220, c.w * 0.24), ink)}
    ${eyebrow(campaign.badge || "Proof / Value", safe, y - 44, ink, brand.accent)}
    ${text(title, safe, baseline(y, title), ink, 880, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 36, sub), ink, 520, fontFamily(brand))}
    ${priceCard(campaign, brand, safe, panelY, half, 150)}
    ${offerCard(campaign, brand, safe + half + 18, panelY, half, 150)}
    ${benefitRail(campaign, safe, panelY + 172, width, 84, ink, brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(230, width * 0.28), 56, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(2, "spotlight-proof-v3", body, [title, sub], format, 0.48, 0.014);
}

export function spotlightCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [spotlightHero(campaign, brand, format), spotlightSplit(campaign, brand, format), spotlightProof(campaign, brand, format)];
}

function retailPrice(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const width = c.w - safe * 2;
  const title = headlineFit(campaign, width * 0.78, c.h * 0.22, Math.min(82, c.w * 0.075), 25);
  const sub = subFit(campaign, width * 0.68, c.h * 0.1, Math.min(23, c.w * 0.022), 14);
  const priceW = Math.min(width * 0.42, 420);
  const priceH = Math.min(c.h * 0.18, 220);
  const y = safe + Math.max(130, c.h * 0.13);
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect x="0" y="0" width="${c.w}" height="${Math.min(180, c.h * 0.14)}" fill="${brand.primary}"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), readable(brand.primary, "#FFFFFF"))}
    ${badge(campaign, c.w - safe - 210, safe, 210, brand.accent, readable(brand.accent, "#10131A"))}
    ${text(title, safe, baseline(y, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 36, sub), ink, 520, fontFamily(brand))}
    ${priceCard(campaign, brand, safe, y + title.height + sub.height + 80, priceW, priceH)}
    ${offerCard(campaign, brand, safe + priceW + 18, y + title.height + sub.height + 80, width - priceW - 18, priceH)}
    ${benefitRail(campaign, safe, c.h - safe - 154, width, 78, ink, brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(240, width * 0.3), 56, brand.primary, readable(brand.primary, "#FFFFFF"), true)}`;
  return candidate(0, "retail-price-v3", body, [title, sub], format, 0.52, 0.012);
}

function retailProduct(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const heroW = c.landscape ? c.w * 0.44 : c.w * 0.56;
  const heroX = c.w - safe - heroW;
  const titleW = c.landscape ? c.w * 0.44 : c.w - safe * 2;
  const title = headlineFit(campaign, titleW, c.h * 0.23, Math.min(84, titleW * 0.14), 25);
  const sub = subFit(campaign, titleW, c.h * 0.1, Math.min(23, titleW * 0.043), 14);
  const y = c.h * 0.24;
  const visual = campaign.assetDataUrl
    ? richAsset(campaign, brand, heroX, safe, heroW, c.h - safe * 2, "retail-product-v3", 28)
    : `${priceCard(campaign, brand, heroX, safe, heroW, Math.min(220, c.h * 0.2))}${offerCard(campaign, brand, heroX, safe + Math.min(246, c.h * 0.22), heroW, Math.min(180, c.h * 0.16))}`;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-paper)"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, titleW * 0.44), ink)}
    ${eyebrow(campaign.badge || "Offer", safe, y - 48, ink, brand.accent)}
    ${text(title, safe, baseline(y, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 36, sub), ink, 520, fontFamily(brand))}
    ${benefitStack(campaign, safe, Math.min(c.h - safe - 300, y + title.height + sub.height + 82), titleW, Math.min(78, c.h * 0.068), ink, brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(240, titleW * 0.5), 56, brand.accent, readable(brand.accent, "#10131A"), true)}
    ${visual}`;
  return candidate(1, "retail-product-v3", body, [title, sub], format, campaign.assetDataUrl ? 0.64 : 0.5, 0.014);
}

function retailGrid(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const c = canvasOf(format);
  const safe = c.safe;
  const ink = readable(brand.background, brand.primary);
  const width = c.w - safe * 2;
  const title = headlineFit(campaign, width, c.h * 0.19, Math.min(76, c.w * 0.068), 24);
  const sub = subFit(campaign, width * 0.74, c.h * 0.09, Math.min(22, c.w * 0.021), 13);
  const y = safe + Math.max(130, c.h * 0.12);
  const panelY = Math.min(c.h - safe - 410, y + title.height + sub.height + 76);
  const leftW = width * 0.42;
  const rightW = width - leftW - 18;
  const body = `${creativeDefs(brand)}
    <rect width="${c.w}" height="${c.h}" fill="${brand.background}"/>
    <rect width="${c.w}" height="${c.h}" fill="url(#v3-grid)"/>
    ${brandLockup(brand, safe, safe + 28, Math.min(220, c.w * 0.24), ink)}
    ${badge(campaign, c.w - safe - 210, safe, 210, brand.primary, readable(brand.primary, "#FFFFFF"))}
    ${text(title, safe, baseline(y, title), ink, 900, fontFamily(brand))}
    ${text(sub, safe, baseline(y + title.height + 32, sub), ink, 520, fontFamily(brand))}
    ${priceCard(campaign, brand, safe, panelY, leftW, 180)}
    ${offerCard(campaign, brand, safe + leftW + 18, panelY, rightW, 180)}
    ${benefitRail(campaign, safe, panelY + 204, width, 84, ink, brand.accent)}
    ${cta(campaign.cta, safe, c.h - safe - 64, Math.min(240, width * 0.3), 56, brand.primary, readable(brand.primary, "#FFFFFF"), true)}
    ${legal(campaign, safe + 270, c.h - safe - 28, width - 270, ink)}`;
  return candidate(2, "retail-grid-v3", body, [title, sub], format, 0.5, 0.01);
}

export function retailCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  return [retailPrice(campaign, brand, format), retailProduct(campaign, brand, format), retailGrid(campaign, brand, format)];
}
