import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  badge, baselineFromTop, benefitRow, blockBottom, brandLockup, clean, defs, esc, fitText,
  fontStack, layoutOf, legalLine, mediaPanel, offerPanel, pillButton, readableOn, textBlock,
} from "./marketing-wow-core";

export function renderEditorial(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const l = layoutOf(format);
  const { w, h, safe, landscape } = l;
  const bg = brand.background;
  const ink = readableOn(bg, brand.primary);
  const accentText = readableOn(brand.accent, ink);
  const family = fontStack(brand);

  if (landscape) {
    const contentW = w * 0.49;
    const mediaX = w * 0.56;
    const mediaW = w - mediaX - safe;
    const mediaY = safe;
    const mediaH = h - safe * 2;
    const headlineTop = h * 0.24;
    const headline = fitText(campaign.headline, contentW - safe, h * 0.28, Math.min(78, h * 0.13), 34, 830, 4, 0.97);
    const headlineY = baselineFromTop(headlineTop, headline);
    const headlineBottom = blockBottom(headlineY, headline);
    const sub = fitText(campaign.subheadline, contentW - safe, h * 0.14, Math.min(23, h * 0.044), 15, 460, 3, 1.26);
    const subTop = headlineBottom + Math.max(16, h * 0.024);
    const subY = baselineFromTop(subTop, sub);
    const offerY = Math.min(h * 0.67, blockBottom(subY, sub) + Math.max(18, h * 0.025));
    const offerH = Math.min(92, h * 0.15);
    const ctaW = Math.min(250, contentW * 0.55);

    return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect width="${w}" height="${h}" fill="url(#mk-grid)" opacity="0.26"/>
      <circle cx="${w * 0.16}" cy="${h * 0.97}" r="${Math.min(w, h) * 0.22}" fill="${brand.accent}" opacity="0.055"/>
      <text x="${contentW}" y="${h * 0.94}" fill="${ink}" opacity="0.035" font-size="${h * 0.29}" font-weight="900" text-anchor="end" font-family="${family}">01</text>
      <rect x="${safe}" y="${safe * 0.78}" width="5" height="${Math.min(70, h * 0.11)}" rx="3" fill="${brand.accent}"/>
      ${brandLockup(brand, safe + 18, safe * 1.08, Math.min(210, contentW * 0.6), ink)}
      ${badge(campaign, safe, h * 0.15, contentW * 0.62, brand.accent, accentText)}
      ${textBlock(headline, safe, headlineY, ink, 830, family)}
      ${textBlock(sub, safe, subY, ink, 460, family)}
      ${offerPanel(campaign, brand, safe, offerY, contentW - safe, offerH)}
      ${pillButton(campaign.cta, safe, h - safe - 54, ctaW, 54, brand.accent, accentText)}
      ${mediaPanel(campaign, brand, mediaX, mediaY, mediaW, mediaH, "editorial", "editorial-media")}
      ${legalLine(campaign, brand, safe + ctaW + 22, h - safe - 23, contentW - safe - ctaW - 22, ink)}`;
  }

  const mediaY = safe * 1.55;
  const mediaH = Math.min(h * (l.tall ? 0.28 : 0.275), w * 0.59);
  const mediaW = w - safe * 2;
  const headlineTop = mediaY + mediaH + safe * 0.54;
  const headline = fitText(campaign.headline, mediaW, h * 0.19, Math.min(w * 0.082, h * 0.068, 88), Math.max(34, w * 0.039), 835, l.tall ? 5 : 4, 0.97);
  const headlineY = baselineFromTop(headlineTop, headline);
  const headlineBottom = blockBottom(headlineY, headline);
  const sub = fitText(campaign.subheadline, mediaW, h * 0.095, Math.min(25, w * 0.026), 16, 460, 3, 1.24);
  const subTop = headlineBottom + Math.max(18, safe * 0.28);
  const subY = baselineFromTop(subTop, sub);
  const subBottom = blockBottom(subY, sub);
  const offerH = Math.max(76, Math.min(108, h * 0.07));
  const offerY = subBottom + Math.max(20, safe * 0.3);
  const benefitH = Math.max(72, Math.min(94, h * 0.068));
  const ctaY = h - safe - 56;
  const benefitY = Math.min(ctaY - benefitH - 28, offerY + offerH + Math.max(20, safe * 0.3));
  const ctaW = Math.min(290, w * 0.36);

  return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
    <rect width="${w}" height="${h}" fill="url(#mk-grid)" opacity="0.16"/>
    <circle cx="${w * 0.91}" cy="${h * 0.055}" r="${Math.min(w, h) * 0.24}" fill="${brand.accent}" opacity="0.075"/>
    <text x="${w - safe}" y="${h - safe * 1.18}" fill="${ink}" opacity="0.035" font-size="${Math.min(w * 0.28, 250)}" font-weight="900" text-anchor="end" font-family="${family}">01</text>
    <rect x="${safe}" y="${safe * 0.66}" width="5" height="${Math.min(72, h * 0.052)}" rx="3" fill="${brand.accent}"/>
    ${brandLockup(brand, safe + 18, safe * 0.94, Math.min(235, w * 0.42), ink)}
    ${mediaPanel(campaign, brand, safe, mediaY, mediaW, mediaH, "editorial", "editorial-media")}
    ${badge(campaign, safe + 20, mediaY + 20, mediaW * 0.48, brand.accent, accentText)}
    ${textBlock(headline, safe, headlineY, ink, 835, family)}
    ${textBlock(sub, safe, subY, ink, 460, family)}
    ${offerPanel(campaign, brand, safe, offerY, mediaW, offerH)}
    ${benefitRow(campaign, brand, safe, benefitY, mediaW, benefitH)}
    ${pillButton(campaign.cta, safe, ctaY, ctaW, 56, brand.accent, accentText)}
    ${legalLine(campaign, brand, safe + ctaW + 24, ctaY + 22, mediaW - ctaW - 24, ink)}`;
}
