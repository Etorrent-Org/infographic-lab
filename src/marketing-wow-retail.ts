import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  badge, baselineFromTop, benefitRow, blockBottom, brandLockup, clean, defs, esc, fitText,
  fontStack, layoutOf, legalLine, mediaPanel, offerPanel, pillButton, readableOn, textBlock,
} from "./marketing-wow-core";

export function renderRetail(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const l = layoutOf(format);
  const { w, h, safe, landscape } = l;
  const bg = brand.background;
  const ink = readableOn(bg, brand.primary);
  const price = clean(campaign.price || "OFFRE", 34);
  const accentFg = readableOn(brand.accent, ink);
  const headerFg = readableOn(brand.primary, "#FFFFFF");
  const family = fontStack(brand);

  if (landscape) {
    const leftW = w * 0.47;
    const headlineTop = h * 0.23;
    const headline = fitText(campaign.headline, leftW - safe * 1.15, h * 0.25, Math.min(74, h * 0.12), 32, 880, 4, 0.95);
    const headlineY = baselineFromTop(headlineTop, headline);
    const headlineBottom = blockBottom(headlineY, headline);
    const sub = fitText(campaign.subheadline, leftW - safe * 1.15, h * 0.13, 20, 14, 480, 3, 1.22);
    const subY = baselineFromTop(headlineBottom + h * 0.035, sub);
    const priceW = Math.min(w * 0.22, 300);
    const priceH = Math.min(110, h * 0.18);
    const priceFit = fitText(price, priceW - 34, priceH * 0.58, Math.min(62, priceH * 0.48), 24, 940, 1, 1);
    const benefitY = h * 0.69;
    return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect x="0" y="0" width="${w}" height="${h * 0.15}" fill="${brand.primary}"/>
      <rect x="0" y="${h * 0.15}" width="${w}" height="${h * 0.85}" fill="url(#mk-dots)" opacity="0.38"/>
      ${brandLockup(brand, safe, h * 0.095, Math.min(220, leftW * 0.58), headerFg)}
      ${badge(campaign, w - safe - Math.min(240, w * 0.22), h * 0.05, Math.min(240, w * 0.22), brand.accent, accentFg)}
      ${textBlock(headline, safe, headlineY, ink, 880, family)}
      ${textBlock(sub, safe, subY, ink, 480, family)}
      <g filter="url(#mk-shadow)"><rect x="${safe}" y="${h * 0.53}" width="${priceW}" height="${priceH}" rx="${Math.min(24, priceH * 0.22)}" fill="${brand.accent}"/>${textBlock(priceFit, safe + priceW / 2, h * 0.53 + priceH * 0.64, accentFg, 940, family, "middle")}</g>
      ${benefitRow(campaign, brand, safe, benefitY, leftW - safe, Math.min(76, h * 0.12))}
      ${pillButton(campaign.cta, safe, h - safe - 52, Math.min(230, leftW * 0.5), 52, brand.primary, headerFg, 12)}
      ${mediaPanel(campaign, brand, w * 0.52, h * 0.22, w * 0.42, h * 0.65, "retail", "retail-media")}`;
  }

  const headerH = Math.max(94, h * 0.105);
  const headlineTop = headerH + safe * 0.46;
  const headline = fitText(campaign.headline, w - safe * 2, h * 0.155, Math.min(w * 0.077, 84), Math.max(34, w * 0.038), 885, 4, 0.95);
  const headlineY = baselineFromTop(headlineTop, headline);
  const headlineBottom = blockBottom(headlineY, headline);
  const mediaY = headlineBottom + safe * 0.46;
  const mediaH = h * (l.tall ? 0.31 : 0.3);
  const priceW = Math.min(w * 0.36, 360);
  const priceH = Math.max(94, Math.min(138, h * 0.078));
  const priceY = mediaY + mediaH - priceH * 0.52;
  const priceFit = fitText(price, priceW - 34, priceH * 0.58, Math.min(62, priceH * 0.48), 24, 940, 1, 1);
  const sub = fitText(campaign.subheadline, w - safe * 2 - priceW - 26, priceH * 0.72, Math.min(23, w * 0.024), 14, 480, 3, 1.2);
  const subX = safe + priceW + 26;
  const subY = baselineFromTop(priceY + 12, sub);
  const offerH = Math.max(72, Math.min(98, h * 0.058));
  const offerY = priceY + priceH + Math.max(24, safe * 0.32);
  const benefitH = Math.max(72, Math.min(92, h * 0.058));
  const ctaY = h - safe - 58;
  const benefitY = Math.min(ctaY - benefitH - 24, offerY + offerH + Math.max(18, safe * 0.26));

  return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
    <rect x="0" y="0" width="${w}" height="${headerH}" fill="${brand.primary}"/>
    <rect x="0" y="${headerH}" width="${w}" height="${h - headerH}" fill="url(#mk-dots)" opacity="0.22"/>
    ${brandLockup(brand, safe, headerH * 0.6, Math.min(235, w * 0.44), headerFg)}
    ${badge(campaign, w - safe - Math.min(250, w * 0.42), headerH * 0.26, Math.min(250, w * 0.42), brand.accent, accentFg)}
    ${textBlock(headline, safe, headlineY, ink, 885, family)}
    ${mediaPanel(campaign, brand, safe, mediaY, w - safe * 2, mediaH, "retail", "retail-media")}
    <g filter="url(#mk-shadow)"><rect x="${safe}" y="${priceY}" width="${priceW}" height="${priceH}" rx="${Math.min(24, priceH * 0.22)}" fill="${brand.accent}"/>${textBlock(priceFit, safe + priceW / 2, priceY + priceH * 0.64, accentFg, 940, family, "middle")}</g>
    ${textBlock(sub, subX, subY, ink, 480, family)}
    ${offerPanel(campaign, brand, safe, offerY, w - safe * 2, offerH)}
    ${benefitRow(campaign, brand, safe, benefitY, w - safe * 2, benefitH)}
    ${pillButton(campaign.cta, safe, ctaY, Math.min(300, w * 0.4), 58, brand.primary, headerFg, 12)}
    ${legalLine(campaign, brand, safe + Math.min(300, w * 0.4) + 24, ctaY + 21, w - safe * 2 - Math.min(300, w * 0.4) - 24, ink)}`;
}
