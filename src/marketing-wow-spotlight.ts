import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  badge, baselineFromTop, benefitRow, blockBottom, brandLockup, clean, defs, esc, fitText,
  fontStack, layoutOf, legalLine, mediaPanel, offerPanel, pillButton, readableOn, textBlock,
} from "./marketing-wow-core";

export function renderSpotlight(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const l = layoutOf(format);
  const { w, h, safe, landscape } = l;
  const bg = brand.background;
  const ink = readableOn(bg, brand.primary);
  const family = fontStack(brand);
  const accentFg = readableOn(brand.accent, ink);

  if (landscape) {
    const mediaW = w * 0.5;
    const contentX = mediaW + safe * 1.08;
    const contentW = w - contentX - safe;
    const headlineTop = h * 0.22;
    const headline = fitText(campaign.headline, contentW, h * 0.27, Math.min(80, h * 0.13), 34, 850, 4, 0.97);
    const headlineY = baselineFromTop(headlineTop, headline);
    const headlineBottom = blockBottom(headlineY, headline);
    const sub = fitText(campaign.subheadline, contentW, h * 0.14, 22, 15, 460, 3, 1.24);
    const subY = baselineFromTop(headlineBottom + h * 0.04, sub);
    const offerY = blockBottom(subY, sub) + h * 0.04;
    const offerH = Math.min(86, h * 0.14);

    return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <rect width="${w}" height="${h}" fill="url(#mk-wash)" opacity="0.62"/>
      <circle cx="${w * 0.08}" cy="${h * 0.9}" r="${Math.min(w, h) * 0.26}" fill="${brand.accent}" opacity="0.08"/>
      ${mediaPanel(campaign, brand, safe, safe, mediaW - safe * 0.15, h - safe * 2, "spotlight", "spotlight-media")}
      ${brandLockup(brand, contentX, safe * 1.02, Math.min(220, contentW * 0.7), ink)}
      ${badge(campaign, contentX, h * 0.125, contentW * 0.7, brand.accent, accentFg)}
      ${textBlock(headline, contentX, headlineY, ink, 850, family)}
      ${textBlock(sub, contentX, subY, ink, 460, family)}
      ${offerPanel(campaign, brand, contentX, offerY, contentW, offerH)}
      ${benefitRow(campaign, brand, contentX, h * 0.69, contentW, Math.min(82, h * 0.13))}
      ${pillButton(campaign.cta, contentX, h - safe - 56, Math.min(260, contentW * 0.66), 56, brand.primary, readableOn(brand.primary, "#FFFFFF"))}`;
  }

  const topRowY = safe * 0.92;
  const headlineTop = safe * 1.62;
  const headline = fitText(campaign.headline, w - safe * 2, h * 0.16, Math.min(w * 0.074, 80), Math.max(32, w * 0.037), 850, 3, 0.97);
  const headlineY = baselineFromTop(headlineTop, headline);
  const headlineBottom = blockBottom(headlineY, headline);
  const mediaY = headlineBottom + safe * 0.52;
  const mediaH = h * (l.tall ? 0.38 : 0.36);
  const sub = fitText(campaign.subheadline, w - safe * 2, h * 0.075, Math.min(24, w * 0.025), 15, 460, 3, 1.23);
  const subTop = mediaY + mediaH + safe * 0.42;
  const subY = baselineFromTop(subTop, sub);
  const offerH = Math.max(72, Math.min(98, h * 0.06));
  const offerY = blockBottom(subY, sub) + Math.max(16, safe * 0.24);
  const benefitH = Math.max(72, Math.min(92, h * 0.06));
  const ctaY = h - safe - 58;
  const benefitY = Math.min(ctaY - benefitH - 24, offerY + offerH + Math.max(18, safe * 0.24));

  return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
    <rect width="${w}" height="${h}" fill="url(#mk-wash)" opacity="0.58"/>
    <circle cx="${w * 0.93}" cy="${h * 0.04}" r="${Math.min(w, h) * 0.2}" fill="${brand.accent}" opacity="0.08"/>
    ${brandLockup(brand, safe, topRowY, Math.min(235, w * 0.44), ink)}
    ${badge(campaign, w - safe - Math.min(250, w * 0.42), safe * 0.57, Math.min(250, w * 0.42), brand.accent, accentFg)}
    ${textBlock(headline, safe, headlineY, ink, 850, family)}
    ${mediaPanel(campaign, brand, safe, mediaY, w - safe * 2, mediaH, "spotlight", "spotlight-media")}
    ${textBlock(sub, safe, subY, ink, 460, family)}
    ${offerPanel(campaign, brand, safe, offerY, w - safe * 2, offerH)}
    ${benefitRow(campaign, brand, safe, benefitY, w - safe * 2, benefitH)}
    ${pillButton(campaign.cta, w - safe - Math.min(300, w * 0.38), ctaY, Math.min(300, w * 0.38), 58, brand.primary, readableOn(brand.primary, "#FFFFFF"))}
    ${legalLine(campaign, brand, safe, ctaY + 22, w - safe * 2 - Math.min(320, w * 0.4), ink)}`;
}
