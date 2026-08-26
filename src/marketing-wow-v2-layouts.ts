import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  abstractHero,
  asset,
  badge,
  baseline,
  benefits,
  brandLockup,
  canvasOf,
  cta,
  defs,
  fitText,
  fontFamily,
  legal,
  makeCandidate,
  offer,
  readable,
  richAsset,
  text,
  type RenderCandidate,
} from "./marketing-wow-v2-core";

function colors(brand: BrandProfile) {
  return {
    bg: brand.background,
    ink: readable(brand.background, brand.primary),
    accentText: readable(brand.accent, brand.primary),
  };
}

function mediaOrArt(campaign: MarketingCampaign, brand: BrandProfile, x: number, y: number, w: number, h: number, id: string, variant: 0 | 1 | 2, dark = false) {
  return campaign.assetDataUrl
    ? richAsset(campaign, brand, x, y, w, h, id, Math.max(20, Math.min(46, Math.min(w, h) * 0.08)))
    : abstractHero(brand, x, y, w, h, variant, dark);
}

export function editorialCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  const c = canvasOf(format);
  const { w, h, safe } = c;
  const { bg, ink, accentText } = colors(brand);
  const serif = fontFamily(brand, true);
  const sans = fontFamily(brand);
  const candidates: RenderCandidate[] = [];

  // 0 — split éditorial : vraie grille texte/image.
  {
    const imageRight = !c.tall;
    const mediaW = c.landscape ? w * 0.43 : w * 0.38;
    const textW = imageRight ? w - safe * 3 - mediaW : w - safe * 2;
    const headlineTop = c.landscape ? h * 0.24 : h * 0.29;
    const headline = fitText(campaign.headline, textW, c.landscape ? h * 0.28 : h * 0.22, Math.min(c.landscape ? 72 : 78, w * 0.075), 27, 720, 0.98);
    const subTop = headlineTop + headline.height + Math.max(18, safe * 0.28);
    const sub = fitText(campaign.subheadline, textW, c.landscape ? h * 0.15 : h * 0.12, Math.min(24, w * 0.024), 13, 450, 1.28);
    const mediaX = imageRight ? w - safe - mediaW : safe;
    const mediaY = c.landscape ? safe : h * 0.08;
    const mediaH = c.landscape ? h - safe * 2 : h * 0.32;
    const textX = imageRight ? safe : safe;
    const baseHeadlineTop = imageRight ? headlineTop : mediaY + mediaH + safe * 0.6;
    const actualHeadline = imageRight ? headline : fitText(campaign.headline, textW, h * 0.18, Math.min(68, w * 0.065), 24, 720, 1.0);
    const actualSubTop = baseHeadlineTop + actualHeadline.height + Math.max(16, safe * 0.25);
    const actualSub = imageRight ? sub : fitText(campaign.subheadline, textW, h * 0.09, 22, 12, 450, 1.25);
    const ctaY = h - safe - 54;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect x="${safe}" y="${safe * 0.72}" width="5" height="64" rx="3" fill="${brand.accent}"/>
      ${brandLockup(brand, safe + 18, safe * 1.05, Math.min(230, textW * 0.55), ink)}
      <text x="${imageRight ? textX : w - safe}" y="${h - safe * 1.12}" fill="${ink}" opacity="0.045" font-size="${Math.min(180, w * 0.18)}" font-weight="800" text-anchor="${imageRight ? "start" : "end"}" font-family="${serif}">01</text>
      ${badge(campaign, textX, baseHeadlineTop - 50, Math.min(260, textW * 0.55), brand.accent, accentText)}
      ${text(actualHeadline, textX, baseline(baseHeadlineTop, actualHeadline), ink, 720, serif)}
      ${text(actualSub, textX, baseline(actualSubTop, actualSub), ink, 450, sans)}
      ${mediaOrArt(campaign, brand, mediaX, mediaY, mediaW, mediaH, "ed-split", 0)}
      ${cta(campaign.cta, textX, ctaY, Math.min(260, textW * 0.55), 54, ink, readable(ink, "#FFFFFF"))}
      ${legal(campaign, textX + Math.min(280, textW * 0.58), ctaY + 21, Math.max(80, textW - Math.min(280, textW * 0.58)), ink)}`;
    candidates.push(makeCandidate(0, "editorial-split", body, [actualHeadline, actualSub], c, mediaW * mediaH / (w * h), 0.1));
  }

  // 1 — cover éditorial : image dominante, cartouche éditorial superposé.
  {
    const coverH = c.landscape ? h : h * 0.58;
    const headlineW = c.landscape ? w * 0.5 : w - safe * 2.4;
    const headline = fitText(campaign.headline, headlineW, c.landscape ? h * 0.28 : h * 0.19, Math.min(74, w * 0.074), 24, 760, 1.0);
    const sub = fitText(campaign.subheadline, headlineW, c.landscape ? h * 0.13 : h * 0.085, 22, 12, 450, 1.25);
    const panelX = safe;
    const panelY = c.landscape ? h * 0.2 : h * 0.47;
    const panelW = c.landscape ? w * 0.54 : w - safe * 2;
    const panelH = c.landscape ? h * 0.64 : h * 0.45;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      ${campaign.assetDataUrl ? `${asset(campaign, 0, 0, w, coverH, 0, "ed-cover")}<rect x="0" y="0" width="${w}" height="${coverH}" fill="${brand.primary}" opacity="0.12"/>` : abstractHero(brand, 0, 0, w, coverH, 1)}
      <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="30" fill="${bg}" filter="url(#pro-shadow)"/>
      <rect x="${panelX + 26}" y="${panelY + 28}" width="58" height="4" fill="${brand.accent}"/>
      ${brandLockup(brand, panelX + 26, panelY + 72, Math.min(220, panelW * 0.43), ink)}
      ${text(headline, panelX + 26, baseline(panelY + 112, headline), ink, 760, serif)}
      ${text(sub, panelX + 26, baseline(panelY + 126 + headline.height, sub), ink, 450, sans)}
      ${cta(campaign.cta, panelX + 26, panelY + panelH - 76, Math.min(250, panelW * 0.45), 50, brand.accent, accentText)}
      ${badge(campaign, w - safe - 230, safe, 230, brand.accent, accentText)}`;
    candidates.push(makeCandidate(1, "editorial-cover", body, [headline, sub], c, coverH / h, 0.07));
  }

  // 2 — typographique : construit sans faux hero.
  {
    const headlineW = c.landscape ? w * 0.62 : w - safe * 2;
    const headlineMaxH = c.landscape ? h * 0.38 : h * 0.28;
    const headline = fitText(campaign.headline, headlineW, headlineMaxH, Math.min(c.landscape ? 82 : 86, w * 0.082), 22, 690, 1.02);
    const subW = c.landscape ? w * 0.44 : w * 0.68;
    const sub = fitText(campaign.subheadline, subW, c.landscape ? h * 0.18 : h * 0.12, 23, 12, 430, 1.28);
    const headlineTop = c.landscape ? h * 0.29 : h * 0.27;
    const subTop = headlineTop + headline.height + safe * 0.42;
    const benefitY = c.landscape ? h * 0.73 : h * 0.72;
    const benefitH = Math.min(88, h * 0.07);
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect width="${w}" height="${h}" fill="url(#pro-grid)" opacity="0.26"/>
      <circle cx="${w * 0.86}" cy="${h * 0.16}" r="${Math.min(w, h) * 0.16}" fill="none" stroke="${brand.accent}" stroke-width="2" opacity="0.38"/>
      <text x="${w - safe}" y="${safe * 1.15}" fill="${ink}" font-size="13" font-weight="750" text-anchor="end" letter-spacing="2.2" font-family="${sans}">CAMPAIGN / 01</text>
      ${brandLockup(brand, safe, safe * 1.1, Math.min(240, w * 0.32), ink)}
      <line x1="${safe}" y1="${h * 0.2}" x2="${w - safe}" y2="${h * 0.2}" stroke="${ink}" stroke-width="1" opacity="0.18"/>
      ${text(headline, safe, baseline(headlineTop, headline), ink, 690, serif)}
      <rect x="${safe}" y="${subTop - 4}" width="5" height="${Math.max(54, sub.height + 16)}" fill="${brand.accent}"/>
      ${text(sub, safe + 24, baseline(subTop, sub), ink, 430, sans)}
      ${offer(campaign, brand, w - safe - Math.min(340, w * 0.3), c.landscape ? h * 0.46 : h * 0.58, Math.min(340, w * 0.3), Math.min(100, h * 0.08))}
      ${benefits(campaign, brand, safe, benefitY, w - safe * 2, benefitH)}
      ${cta(campaign.cta, safe, h - safe - 52, Math.min(240, w * 0.3), 52, brand.accent, accentText)}`;
    candidates.push(makeCandidate(2, "editorial-typographic", body, [headline, sub], c, 0.24, 0.11));
  }

  return candidates;
}

export function spotlightCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  const c = canvasOf(format);
  const { w, h, safe } = c;
  const { bg, ink, accentText } = colors(brand);
  const family = fontFamily(brand);
  const candidates: RenderCandidate[] = [];

  // 0 — center stage.
  {
    const headline = fitText(campaign.headline, w - safe * 2, h * 0.15, Math.min(64, w * 0.064), 22, 830, 1.0);
    const mediaW = c.landscape ? w * 0.43 : w * 0.7;
    const mediaH = c.landscape ? h * 0.62 : h * 0.45;
    const mediaX = c.landscape ? w * 0.52 : (w - mediaW) / 2;
    const mediaY = c.landscape ? h * 0.2 : h * 0.25;
    const textX = safe;
    const textW = c.landscape ? w * 0.4 : w - safe * 2;
    const sub = fitText(campaign.subheadline, textW, h * 0.11, 21, 12, 450, 1.24);
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <circle cx="${mediaX + mediaW / 2}" cy="${mediaY + mediaH / 2}" r="${Math.min(mediaW, mediaH) * 0.58}" fill="url(#pro-halo)"/>
      ${brandLockup(brand, safe, safe * 1.05, Math.min(220, w * 0.3), ink)}
      ${c.landscape ? text(headline, textX, baseline(h * 0.29, headline), ink, 830, family) : text(headline, safe, baseline(h * 0.12, headline), ink, 830, family)}
      ${c.landscape ? text(sub, textX, baseline(h * 0.32 + headline.height, sub), ink, 450, family) : ""}
      ${campaign.assetDataUrl ? richAsset(campaign, brand, mediaX, mediaY, mediaW, mediaH, "sp-center", 42) : abstractHero(brand, mediaX, mediaY, mediaW, mediaH, 1)}
      ${benefits(campaign, brand, safe, h * 0.79, w - safe * 2, Math.min(86, h * 0.07))}
      ${cta(campaign.cta, w - safe - Math.min(250, w * 0.29), h - safe - 54, Math.min(250, w * 0.29), 54, ink, readable(ink, "#fff"))}`;
    candidates.push(makeCandidate(0, "spotlight-center-stage", body, [headline, sub], c, mediaW * mediaH / (w * h), 0.06));
  }

  // 1 — split hero.
  {
    const mediaW = c.landscape ? w * 0.49 : w * 0.44;
    const mediaH = c.landscape ? h - safe * 2 : h * 0.58;
    const mediaX = w - safe - mediaW;
    const mediaY = c.landscape ? safe : h * 0.2;
    const textW = w - safe * 3 - mediaW;
    const headline = fitText(campaign.headline, Math.max(220, textW), h * 0.28, Math.min(70, w * 0.068), 20, 850, 0.98);
    const sub = fitText(campaign.subheadline, Math.max(220, textW), h * 0.13, 22, 11, 450, 1.24);
    const headlineTop = c.landscape ? h * 0.26 : h * 0.31;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect x="${mediaX - safe * 0.45}" y="0" width="${w - mediaX + safe * 0.45}" height="${h}" fill="url(#pro-wash)"/>
      ${brandLockup(brand, safe, safe * 1.06, Math.min(210, textW * 0.75), ink)}
      ${badge(campaign, safe, headlineTop - 50, Math.min(240, textW), brand.accent, accentText)}
      ${text(headline, safe, baseline(headlineTop, headline), ink, 850, family)}
      ${text(sub, safe, baseline(headlineTop + headline.height + safe * 0.32, sub), ink, 450, family)}
      ${campaign.assetDataUrl ? richAsset(campaign, brand, mediaX, mediaY, mediaW, mediaH, "sp-split", 44) : abstractHero(brand, mediaX, mediaY, mediaW, mediaH, 0)}
      ${cta(campaign.cta, safe, h - safe - 54, Math.min(245, textW), 54, brand.accent, accentText)}`;
    candidates.push(makeCandidate(1, "spotlight-split-hero", body, [headline, sub], c, mediaW * mediaH / (w * h), 0.08));
  }

  // 2 — full bleed.
  {
    const panelW = c.landscape ? w * 0.48 : w - safe * 2;
    const headline = fitText(campaign.headline, panelW - 44, c.landscape ? h * 0.28 : h * 0.2, Math.min(66, w * 0.064), 20, 850, 1.0);
    const sub = fitText(campaign.subheadline, panelW - 44, h * 0.11, 20, 11, 450, 1.25);
    const panelH = Math.min(h * 0.66, headline.height + sub.height + 190);
    const panelY = h - safe - panelH;
    const body = `<rect width="${w}" height="${h}" fill="${brand.primary}"/>${defs(brand)}
      ${campaign.assetDataUrl ? `${asset(campaign, 0, 0, w, h, 0, "sp-full")}<rect width="${w}" height="${h}" fill="${brand.primary}" opacity="0.35"/>` : `<rect width="${w}" height="${h}" fill="url(#pro-dark-wash)"/>${abstractHero(brand, w * 0.42, h * 0.12, w * 0.5, h * 0.62, 1, true)}`}
      <rect x="${safe}" y="${panelY}" width="${panelW}" height="${panelH}" rx="28" fill="${brand.primary}" opacity="0.9"/>
      ${brandLockup(brand, safe + 24, panelY + 56, Math.min(210, panelW * 0.5), "#fff")}
      ${text(headline, safe + 24, baseline(panelY + 92, headline), "#fff", 850, family)}
      ${text(sub, safe + 24, baseline(panelY + 106 + headline.height, sub), "#fff", 450, family)}
      ${cta(campaign.cta, safe + 24, panelY + panelH - 72, Math.min(230, panelW * 0.5), 48, brand.accent, accentText)}`;
    candidates.push(makeCandidate(2, "spotlight-full-bleed", body, [headline, sub], c, 0.66, 0.04));
  }

  return candidates;
}

export function impactCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  const c = canvasOf(format);
  const { w, h, safe } = c;
  const family = fontFamily(brand);
  const accentText = readable(brand.accent, brand.primary);
  const candidates: RenderCandidate[] = [];

  // 0 — diagonal campaign.
  {
    const textW = c.landscape ? w * 0.52 : w - safe * 2;
    const headline = fitText(campaign.headline, textW, c.landscape ? h * 0.34 : h * 0.27, Math.min(82, w * 0.078), 24, 900, 0.94);
    const sub = fitText(campaign.subheadline, c.landscape ? w * 0.42 : w * 0.7, h * 0.12, 22, 12, 480, 1.22);
    const top = c.landscape ? h * 0.28 : h * 0.26;
    const body = `<rect width="${w}" height="${h}" fill="${brand.primary}"/>${defs(brand)}
      <path d="M${w * 0.5} 0 L${w} 0 L${w} ${h * 0.73} L${w * 0.22} ${h} L0 ${h} L0 ${h * 0.76}Z" fill="${brand.accent}" opacity="0.16"/>
      <path d="M${w * 0.68} 0 L${w} 0 L${w} ${h * 0.45} L${w * 0.38} ${h * 0.78}Z" fill="${brand.accent}" opacity="0.92"/>
      <text x="${w - safe}" y="${h * 0.2}" fill="#fff" opacity="0.08" font-size="${Math.min(190, w * 0.2)}" font-weight="950" text-anchor="end" font-family="${family}">01</text>
      ${brandLockup(brand, safe, safe * 1.05, Math.min(220, w * 0.32), "#fff")}
      ${badge(campaign, safe, top - 48, Math.min(240, textW * 0.48), brand.accent, accentText)}
      ${text(headline, safe, baseline(top, headline), "#fff", 900, family)}
      ${text(sub, safe, baseline(top + headline.height + safe * 0.34, sub), "#fff", 480, family)}
      ${campaign.assetDataUrl ? richAsset(campaign, brand, w * 0.61, h * 0.48, w * 0.31, h * 0.34, "imp-diag", 32) : ""}
      ${cta(campaign.cta, safe, h - safe - 56, Math.min(255, w * 0.3), 56, brand.accent, accentText)}`;
    candidates.push(makeCandidate(0, "impact-diagonal", body, [headline, sub], c, campaign.assetDataUrl ? 0.18 : 0.24, 0.04));
  }

  // 1 — campaign poster.
  {
    const headlineW = w - safe * 2;
    const headline = fitText(campaign.headline, headlineW, c.landscape ? h * 0.32 : h * 0.31, Math.min(94, w * 0.088), 23, 920, 0.92);
    const sub = fitText(campaign.subheadline, Math.min(w * 0.62, 680), h * 0.11, 21, 11, 470, 1.2);
    const top = c.landscape ? h * 0.3 : h * 0.28;
    const body = `<rect width="${w}" height="${h}" fill="${brand.primary}"/>${defs(brand)}
      <circle cx="${w * 0.82}" cy="${h * 0.19}" r="${Math.min(w, h) * 0.23}" fill="none" stroke="${brand.accent}" stroke-width="${Math.max(18, w * 0.03)}"/>
      <rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="${brand.accent}"/>
      ${brandLockup(brand, safe, safe * 1.06, Math.min(230, w * 0.33), "#fff")}
      <text x="${safe}" y="${h * 0.18}" fill="${brand.accent}" font-size="14" font-weight="850" letter-spacing="3" font-family="${family}">CAMPAIGN / NOW</text>
      ${text(headline, safe, baseline(top, headline), "#fff", 920, family)}
      ${text(sub, safe, baseline(top + headline.height + safe * 0.28, sub), "#fff", 470, family)}
      ${offer(campaign, brand, safe, h * 0.76, w * 0.52, Math.min(94, h * 0.09), true)}
      ${cta(campaign.cta, w - safe - Math.min(250, w * 0.3), h - safe - 56, Math.min(250, w * 0.3), 56, brand.primary, "#fff")}`;
    candidates.push(makeCandidate(1, "impact-poster", body, [headline, sub], c, 0.28, 0.03));
  }

  // 2 — split blast, plus dense.
  {
    const leftW = c.landscape ? w * 0.5 : w * 0.58;
    const headline = fitText(campaign.headline, leftW - safe * 1.4, h * 0.3, Math.min(72, w * 0.068), 19, 880, 0.96);
    const sub = fitText(campaign.subheadline, leftW - safe * 1.4, h * 0.14, 20, 10, 450, 1.23);
    const body = `<rect width="${w}" height="${h}" fill="${brand.primary}"/>${defs(brand)}
      <rect x="${leftW}" y="0" width="${w - leftW}" height="${h}" fill="${brand.accent}"/>
      <path d="M${leftW - 90} 0 L${leftW + 120} 0 L${leftW - 70} ${h} L${leftW - 280} ${h}Z" fill="#fff" opacity="0.07"/>
      ${brandLockup(brand, safe, safe * 1.06, Math.min(210, leftW * 0.55), "#fff")}
      ${text(headline, safe, baseline(h * 0.27, headline), "#fff", 880, family)}
      ${text(sub, safe, baseline(h * 0.3 + headline.height, sub), "#fff", 450, family)}
      ${benefits(campaign, brand, safe, h * 0.64, leftW - safe * 1.3, Math.min(82, h * 0.07), true)}
      <text x="${leftW + (w - leftW) / 2}" y="${h * 0.28}" fill="${accentText}" font-size="${Math.min(28, w * 0.025)}" font-weight="850" text-anchor="middle" letter-spacing="2" font-family="${family}">${campaign.price ? "OFFRE" : "IMPACT"}</text>
      <text x="${leftW + (w - leftW) / 2}" y="${h * 0.44}" fill="${accentText}" font-size="${Math.min(74, w * 0.068)}" font-weight="950" text-anchor="middle" font-family="${family}">${campaign.price ? campaign.price : "01"}</text>
      ${campaign.assetDataUrl ? richAsset(campaign, brand, leftW + safe * 0.45, h * 0.51, w - leftW - safe * 0.9, h * 0.28, "imp-split", 24) : ""}
      ${cta(campaign.cta, leftW + safe * 0.45, h - safe - 54, w - leftW - safe * 0.9, 54, brand.primary, "#fff", true)}`;
    candidates.push(makeCandidate(2, "impact-split-blast", body, [headline, sub], c, 0.34, 0.02));
  }

  return candidates;
}

export function retailCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  const c = canvasOf(format);
  const { w, h, safe } = c;
  const { bg, ink, accentText } = colors(brand);
  const family = fontFamily(brand);
  const candidates: RenderCandidate[] = [];
  const price = campaign.price?.trim() || "OFFRE";

  // 0 — offer hero.
  {
    const headline = fitText(campaign.headline, c.landscape ? w * 0.46 : w * 0.62, h * 0.2, Math.min(68, w * 0.065), 20, 880, 0.98);
    const sub = fitText(campaign.subheadline, c.landscape ? w * 0.42 : w * 0.56, h * 0.1, 20, 10, 450, 1.22);
    const mediaX = c.landscape ? w * 0.57 : w * 0.48;
    const mediaY = c.landscape ? h * 0.2 : h * 0.34;
    const mediaW = w - mediaX - safe;
    const mediaH = c.landscape ? h * 0.55 : h * 0.38;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect width="${w}" height="${h * 0.17}" fill="${brand.primary}"/>
      ${brandLockup(brand, safe, h * 0.105, Math.min(220, w * 0.3), "#fff")}
      ${badge(campaign, w - safe - 230, h * 0.06, 230, brand.accent, accentText)}
      ${text(headline, safe, baseline(h * 0.26, headline), ink, 880, family)}
      ${text(sub, safe, baseline(h * 0.29 + headline.height, sub), ink, 450, family)}
      <circle cx="${safe + Math.min(160, w * 0.15)}" cy="${h * 0.61}" r="${Math.min(132, Math.min(w, h) * 0.12)}" fill="${brand.accent}" filter="url(#pro-soft-shadow)"/>
      <text x="${safe + Math.min(160, w * 0.15)}" y="${h * 0.63}" fill="${accentText}" font-size="${Math.min(58, w * 0.052)}" font-weight="950" text-anchor="middle" font-family="${family}">${price}</text>
      ${mediaOrArt(campaign, brand, mediaX, mediaY, mediaW, mediaH, "ret-offer", 0)}
      ${cta(campaign.cta, safe, h - safe - 56, Math.min(270, w * 0.32), 56, brand.primary, "#fff", true)}`;
    candidates.push(makeCandidate(0, "retail-offer-hero", body, [headline, sub], c, mediaW * mediaH / (w * h), 0.04));
  }

  // 1 — shelf card.
  {
    const headline = fitText(campaign.headline, w - safe * 2, h * 0.16, Math.min(58, w * 0.055), 18, 850, 1.0);
    const mediaW = w - safe * 2;
    const mediaH = c.landscape ? h * 0.42 : h * 0.43;
    const mediaY = h * 0.23;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect width="${w}" height="${h}" fill="url(#pro-dots)" opacity="0.4"/>
      ${brandLockup(brand, safe, safe * 1.06, Math.min(220, w * 0.3), ink)}
      ${text(headline, safe, baseline(h * 0.13, headline), ink, 850, family)}
      ${mediaOrArt(campaign, brand, safe, mediaY, mediaW, mediaH, "ret-shelf", 1)}
      <rect x="${safe}" y="${mediaY + mediaH - 72}" width="${mediaW}" height="72" rx="0" fill="${brand.primary}" opacity="0.94"/>
      <text x="${safe + 24}" y="${mediaY + mediaH - 25}" fill="#fff" font-size="18" font-weight="750" font-family="${family}">${campaign.badge ? campaign.badge.toUpperCase() : "OFFRE DU MOMENT"}</text>
      <text x="${w - safe - 24}" y="${mediaY + mediaH - 22}" fill="${brand.accent}" font-size="34" font-weight="950" text-anchor="end" font-family="${family}">${price}</text>
      ${benefits(campaign, brand, safe, mediaY + mediaH + 26, mediaW, Math.min(84, h * 0.07))}
      ${cta(campaign.cta, w - safe - Math.min(270, w * 0.32), h - safe - 56, Math.min(270, w * 0.32), 56, brand.accent, accentText, true)}`;
    candidates.push(makeCandidate(1, "retail-shelf", body, [headline], c, mediaW * mediaH / (w * h), 0.04));
  }

  // 2 — flyer dense structuré.
  {
    const headline = fitText(campaign.headline, w - safe * 2, h * 0.17, Math.min(62, w * 0.058), 18, 900, 0.96);
    const sub = fitText(campaign.subheadline, w * 0.52, h * 0.1, 20, 10, 450, 1.2);
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect width="${w}" height="${h * 0.19}" fill="${brand.primary}"/>
      <rect x="${w * 0.69}" y="0" width="${w * 0.31}" height="${h * 0.19}" fill="${brand.accent}"/>
      ${brandLockup(brand, safe, h * 0.11, Math.min(220, w * 0.29), "#fff")}
      <text x="${w * 0.845}" y="${h * 0.12}" fill="${accentText}" font-size="${Math.min(48, w * 0.045)}" font-weight="950" text-anchor="middle" font-family="${family}">${price}</text>
      ${text(headline, safe, baseline(h * 0.27, headline), ink, 900, family)}
      ${text(sub, safe, baseline(h * 0.31 + headline.height, sub), ink, 450, family)}
      ${mediaOrArt(campaign, brand, w * 0.58, h * 0.34, w * 0.34, h * 0.32, "ret-flyer", 2)}
      ${offer(campaign, brand, safe, h * 0.53, w * 0.45, Math.min(110, h * 0.09))}
      ${benefits(campaign, brand, safe, h * 0.68, w - safe * 2, Math.min(90, h * 0.07))}
      ${cta(campaign.cta, safe, h - safe - 58, Math.min(280, w * 0.34), 58, brand.primary, "#fff", true)}
      ${legal(campaign, safe + Math.min(310, w * 0.37), h - safe - 24, w - safe * 2 - Math.min(310, w * 0.37), ink)}`;
    candidates.push(makeCandidate(2, "retail-flyer", body, [headline, sub], c, 0.22, 0.03));
  }

  return candidates;
}

export function zenCandidates(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat): RenderCandidate[] {
  const c = canvasOf(format);
  const { w, h, safe } = c;
  const { bg, ink } = colors(brand);
  const serif = fontFamily(brand, true);
  const sans = fontFamily(brand);
  const candidates: RenderCandidate[] = [];

  // 0 — gallery.
  {
    const headline = fitText(campaign.headline, c.landscape ? w * 0.42 : w * 0.68, h * 0.2, Math.min(58, w * 0.055), 18, 620, 1.08);
    const sub = fitText(campaign.subheadline, c.landscape ? w * 0.38 : w * 0.58, h * 0.1, 19, 10, 420, 1.3);
    const mediaX = c.landscape ? w * 0.55 : w * 0.57;
    const mediaY = c.landscape ? safe : h * 0.47;
    const mediaW = w - mediaX - safe;
    const mediaH = c.landscape ? h - safe * 2 : h * 0.32;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <circle cx="${w * 0.88}" cy="${h * 0.13}" r="${Math.min(w, h) * 0.1}" fill="${brand.accent}" opacity="0.16"/>
      ${brandLockup(brand, safe, safe * 1.04, Math.min(210, w * 0.3), ink)}
      <line x1="${safe}" y1="${h * 0.2}" x2="${safe + 70}" y2="${h * 0.2}" stroke="${brand.accent}" stroke-width="5" stroke-linecap="round"/>
      ${text(headline, safe, baseline(h * 0.29, headline), ink, 620, serif)}
      ${text(sub, safe, baseline(h * 0.31 + headline.height, sub), ink, 420, sans)}
      ${mediaOrArt(campaign, brand, mediaX, mediaY, mediaW, mediaH, "zen-gallery", 0)}
      <text x="${safe}" y="${h - safe}" fill="${ink}" font-size="16" font-weight="700" font-family="${sans}">${campaign.cta} →</text>`;
    candidates.push(makeCandidate(0, "zen-gallery", body, [headline, sub], c, mediaW * mediaH / (w * h), 0.17));
  }

  // 1 — centered editorial.
  {
    const headline = fitText(campaign.headline, w * 0.72, h * 0.24, Math.min(62, w * 0.058), 18, 590, 1.12);
    const sub = fitText(campaign.subheadline, w * 0.56, h * 0.11, 19, 10, 410, 1.3);
    const x = w / 2;
    const top = h * 0.31;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <circle cx="${x}" cy="${h * 0.19}" r="${Math.min(w, h) * 0.075}" fill="none" stroke="${brand.accent}" stroke-width="2" opacity="0.55"/>
      <line x1="${w * 0.2}" y1="${h * 0.22}" x2="${w * 0.8}" y2="${h * 0.22}" stroke="${ink}" stroke-width="1" opacity="0.13"/>
      ${brandLockup(brand, safe, safe * 1.04, Math.min(210, w * 0.3), ink)}
      ${text(headline, x, baseline(top, headline), ink, 590, serif, "middle")}
      ${text(sub, x, baseline(top + headline.height + safe * 0.5, sub), ink, 410, sans, "middle")}
      ${campaign.assetDataUrl ? richAsset(campaign, brand, w * 0.33, h * 0.62, w * 0.34, h * 0.2, "zen-center", 999) : `<circle cx="${x}" cy="${h * 0.72}" r="${Math.min(w, h) * 0.095}" fill="${brand.accent}" opacity="0.12"/><circle cx="${x}" cy="${h * 0.72}" r="${Math.min(w, h) * 0.055}" fill="none" stroke="${ink}" stroke-width="1.5" opacity="0.18"/>`}
      <text x="${x}" y="${h - safe}" fill="${ink}" font-size="15" font-weight="700" text-anchor="middle" font-family="${sans}">${campaign.cta} →</text>`;
    candidates.push(makeCandidate(1, "zen-centered-editorial", body, [headline, sub], c, 0.18, 0.2));
  }

  // 2 — balanced columns pour contenu dense.
  {
    const headline = fitText(campaign.headline, c.landscape ? w * 0.5 : w - safe * 2, h * 0.23, Math.min(56, w * 0.052), 17, 610, 1.1);
    const sub = fitText(campaign.subheadline, c.landscape ? w * 0.42 : w * 0.66, h * 0.12, 18, 9, 410, 1.3);
    const headlineTop = h * 0.27;
    const body = `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect x="${safe}" y="${safe}" width="${w - safe * 2}" height="${h - safe * 2}" fill="none" stroke="${ink}" stroke-width="1" opacity="0.1"/>
      ${brandLockup(brand, safe * 1.25, safe * 1.55, Math.min(210, w * 0.28), ink)}
      <text x="${w - safe * 1.25}" y="${safe * 1.55}" fill="${ink}" opacity="0.55" font-size="12" font-weight="700" text-anchor="end" letter-spacing="2" font-family="${sans}">QUIET IMPACT</text>
      ${text(headline, safe * 1.25, baseline(headlineTop, headline), ink, 610, serif)}
      ${text(sub, safe * 1.25, baseline(headlineTop + headline.height + safe * 0.42, sub), ink, 410, sans)}
      <line x1="${safe * 1.25}" y1="${h * 0.62}" x2="${w - safe * 1.25}" y2="${h * 0.62}" stroke="${ink}" stroke-width="1" opacity="0.12"/>
      ${offer(campaign, brand, safe * 1.25, h * 0.66, c.landscape ? w * 0.42 : w * 0.54, Math.min(96, h * 0.07))}
      ${benefits(campaign, brand, c.landscape ? w * 0.55 : safe * 1.25, c.landscape ? h * 0.66 : h * 0.78, c.landscape ? w * 0.35 : w - safe * 2.5, Math.min(82, h * 0.06))}
      <text x="${safe * 1.25}" y="${h - safe * 1.25}" fill="${ink}" font-size="15" font-weight="700" font-family="${sans}">${campaign.cta} →</text>`;
    candidates.push(makeCandidate(2, "zen-balanced", body, [headline, sub], c, 0.2, 0.12));
  }

  return candidates;
}
