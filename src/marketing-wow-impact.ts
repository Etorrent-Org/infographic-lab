import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  badge, baselineFromTop, benefitRow, blockBottom, brandLockup, clean, defs, esc, fitText,
  fontStack, layoutOf, legalLine, mediaPanel, offerPanel, pillButton, readableOn, textBlock,
} from "./marketing-wow-core";

export function renderImpact(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const l = layoutOf(format);
  const { w, h, safe, landscape } = l;
  const bg = brand.primary;
  const fg = readableOn(bg, "#FFFFFF");
  const accentFg = readableOn(brand.accent, bg);
  const family = fontStack(brand);

  if (landscape) {
    const contentW = w * 0.56;
    const mediaX = w * 0.61;
    const mediaW = w - mediaX - safe;
    const headlineTop = h * 0.24;
    const headline = fitText(campaign.headline, contentW - safe * 1.2, h * 0.29, Math.min(94, h * 0.15), 38, 900, 4, 0.9);
    const headlineY = baselineFromTop(headlineTop, headline);
    const headlineBottom = blockBottom(headlineY, headline);
    const sub = fitText(campaign.subheadline, contentW - safe * 1.2, h * 0.13, 22, 15, 500, 3, 1.22);
    const subY = baselineFromTop(headlineBottom + h * 0.035, sub);
    const benefitY = Math.min(h * 0.69, blockBottom(subY, sub) + h * 0.04);
    const benefitH = Math.min(78, h * 0.13);

    return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <path d="M${w * 0.42} 0 L${w} 0 L${w} ${h} L${w * 0.68} ${h}Z" fill="${brand.accent}" opacity="0.13"/>
      <path d="M0 ${h * 0.84} L${w * 0.52} ${h * 0.63} L${w * 0.68} ${h} L0 ${h}Z" fill="${brand.accent}" opacity="0.09"/>
      <text x="${contentW}" y="${h * 0.97}" fill="${fg}" opacity="0.045" font-size="${h * 0.34}" font-weight="950" text-anchor="end" font-family="${family}">01</text>
      ${brandLockup(brand, safe, safe * 1.02, Math.min(220, contentW * 0.55), fg)}
      ${badge(campaign, safe, h * 0.14, contentW * 0.5, brand.accent, accentFg)}
      ${textBlock(headline, safe, headlineY, fg, 900, family)}
      ${textBlock(sub, safe, subY, fg, 500, family)}
      ${benefitRow(campaign, brand, safe, benefitY, contentW - safe, benefitH, true)}
      ${pillButton(campaign.cta, safe, h - safe - 58, Math.min(270, contentW * 0.46), 58, brand.accent, accentFg)}
      ${mediaPanel(campaign, brand, mediaX, safe * 1.45, mediaW, h - safe * 2.9, "impact", "impact-media")}`;
  }

  const mediaY = safe * 1.48;
  const mediaH = h * (l.tall ? 0.23 : 0.245);
  const headlineTop = mediaY + mediaH + safe * 0.5;
  const headline = fitText(campaign.headline, w - safe * 2, h * 0.2, Math.min(w * 0.091, 98), Math.max(36, w * 0.041), 900, l.tall ? 5 : 4, 0.9);
  const headlineY = baselineFromTop(headlineTop, headline);
  const headlineBottom = blockBottom(headlineY, headline);
  const sub = fitText(campaign.subheadline, w - safe * 2, h * 0.085, Math.min(25, w * 0.026), 16, 500, 3, 1.2);
  const subY = baselineFromTop(headlineBottom + Math.max(18, safe * 0.28), sub);
  const offerH = Math.max(72, Math.min(98, h * 0.064));
  const offerY = blockBottom(subY, sub) + Math.max(18, safe * 0.26);
  const benefitH = Math.max(72, Math.min(92, h * 0.062));
  const ctaY = h - safe - 58;
  const benefitY = Math.min(ctaY - benefitH - 26, offerY + offerH + Math.max(18, safe * 0.26));

  return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
    <path d="M0 ${h * 0.68} L${w} ${h * 0.5} L${w} ${h} L0 ${h}Z" fill="${brand.accent}" opacity="0.13"/>
    <path d="M${w * 0.58} 0 L${w} 0 L${w} ${h * 0.2} L${w * 0.66} ${h * 0.28}Z" fill="${brand.accent}" opacity="0.08"/>
    <text x="${w - safe}" y="${h - safe * 0.92}" fill="${fg}" opacity="0.04" font-size="${Math.min(w * 0.31, 290)}" font-weight="950" text-anchor="end" font-family="${family}">01</text>
    ${brandLockup(brand, safe, safe * 0.95, Math.min(235, w * 0.44), fg)}
    ${mediaPanel(campaign, brand, safe, mediaY, w - safe * 2, mediaH, "impact", "impact-media")}
    ${badge(campaign, safe + 20, mediaY + 20, (w - safe * 2) * 0.45, brand.accent, accentFg)}
    ${textBlock(headline, safe, headlineY, fg, 900, family)}
    ${textBlock(sub, safe, subY, fg, 500, family)}
    ${offerPanel(campaign, brand, safe, offerY, w - safe * 2, offerH, true)}
    ${benefitRow(campaign, brand, safe, benefitY, w - safe * 2, benefitH, true)}
    ${pillButton(campaign.cta, safe, ctaY, Math.min(300, w * 0.4), 58, brand.accent, accentFg)}
    ${legalLine(campaign, brand, safe + Math.min(300, w * 0.4) + 24, ctaY + 22, w - safe * 2 - Math.min(300, w * 0.4) - 24, fg)}`;
}
