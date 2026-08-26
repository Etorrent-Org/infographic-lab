import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  badge, baselineFromTop, benefitRow, blockBottom, brandLockup, clean, defs, esc, fitText,
  fontStack, layoutOf, legalLine, mediaPanel, offerPanel, pillButton, readableOn, textBlock,
} from "./marketing-wow-core";

export function renderZen(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const l = layoutOf(format);
  const { w, h, safe, landscape } = l;
  const bg = brand.background;
  const ink = readableOn(bg, brand.primary);
  const family = fontStack(brand, true);
  const sans = fontStack(brand);
  const accentFg = readableOn(brand.accent, ink);

  if (landscape) {
    const contentW = w * 0.52;
    const headlineTop = h * 0.24;
    const headline = fitText(campaign.headline, contentW - safe, h * 0.29, Math.min(76, h * 0.13), 34, 640, 4, 1.03);
    const headlineY = baselineFromTop(headlineTop, headline);
    const headlineBottom = blockBottom(headlineY, headline);
    const sub = fitText(campaign.subheadline, contentW - safe, h * 0.15, 21, 14, 430, 4, 1.32);
    const subY = baselineFromTop(headlineBottom + h * 0.045, sub);
    const offerY = blockBottom(subY, sub) + h * 0.045;
    const offerH = Math.min(84, h * 0.14);

    return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
      <circle cx="${w * 0.83}" cy="${h * 0.28}" r="${Math.min(w, h) * 0.3}" fill="${brand.accent}" opacity="0.09"/>
      <circle cx="${w * 0.83}" cy="${h * 0.28}" r="${Math.min(w, h) * 0.19}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.12"/>
      <path d="M${w * 0.58} ${h * 0.82} C${w * 0.7} ${h * 0.67},${w * 0.82} ${h * 0.96},${w * 0.96} ${h * 0.72}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.15"/>
      ${brandLockup(brand, safe, safe * 1.02, Math.min(220, contentW * 0.58), ink)}
      <line x1="${safe}" y1="${h * 0.18}" x2="${safe + 88}" y2="${h * 0.18}" stroke="${brand.accent}" stroke-width="5" stroke-linecap="round"/>
      ${badge(campaign, w - safe - Math.min(240, w * 0.22), safe * 0.72, Math.min(240, w * 0.22), brand.accent, accentFg)}
      ${textBlock(headline, safe, headlineY, ink, 640, family)}
      ${textBlock(sub, safe, subY, ink, 430, sans)}
      ${offerPanel(campaign, brand, safe, offerY, contentW - safe, offerH)}
      ${mediaPanel(campaign, brand, w * 0.62, h * 0.43, w * 0.3, h * 0.39, "zen", "zen-media")}
      <text x="${safe}" y="${h - safe * 0.72}" fill="${ink}" font-size="18" font-weight="680" font-family="${sans}">${esc(clean(campaign.cta, 42))} →</text>`;
  }

  const headlineTop = h * 0.215;
  const headline = fitText(campaign.headline, w - safe * 2, h * 0.22, Math.min(w * 0.079, 84), Math.max(34, w * 0.039), 640, l.tall ? 5 : 4, 1.04);
  const headlineY = baselineFromTop(headlineTop, headline);
  const headlineBottom = blockBottom(headlineY, headline);
  const mediaY = Math.max(h * 0.48, headlineBottom + safe * 0.56);
  const mediaH = h * (l.tall ? 0.2 : 0.185);
  const sub = fitText(campaign.subheadline, w - safe * 2, h * 0.075, Math.min(23, w * 0.024), 14, 430, 4, 1.3);
  const subY = baselineFromTop(mediaY + mediaH + safe * 0.42, sub);
  const offerH = Math.max(72, Math.min(96, h * 0.055));
  const offerY = blockBottom(subY, sub) + Math.max(18, safe * 0.26);
  const benefitH = Math.max(70, Math.min(90, h * 0.055));
  const footerY = h - safe * 0.8;
  const benefitY = Math.min(footerY - benefitH - 58, offerY + offerH + Math.max(18, safe * 0.25));

  return `<rect width="${w}" height="${h}" fill="${bg}"/>${defs(brand)}
    <circle cx="${w * 0.82}" cy="${h * 0.12}" r="${Math.min(w, h) * 0.19}" fill="${brand.accent}" opacity="0.09"/>
    <circle cx="${w * 0.82}" cy="${h * 0.12}" r="${Math.min(w, h) * 0.115}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.12"/>
    <path d="M${safe} ${h * 0.77} C${w * 0.3} ${h * 0.7},${w * 0.55} ${h * 0.85},${w - safe} ${h * 0.72}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.14"/>
    ${brandLockup(brand, safe, safe * 0.94, Math.min(235, w * 0.44), ink)}
    ${badge(campaign, w - safe - Math.min(250, w * 0.42), safe * 0.57, Math.min(250, w * 0.42), brand.accent, accentFg)}
    <line x1="${safe}" y1="${h * 0.17}" x2="${safe + 88}" y2="${h * 0.17}" stroke="${brand.accent}" stroke-width="5" stroke-linecap="round"/>
    ${textBlock(headline, safe, headlineY, ink, 640, family)}
    ${mediaPanel(campaign, brand, safe, mediaY, w - safe * 2, mediaH, "zen", "zen-media")}
    ${textBlock(sub, safe, subY, ink, 430, sans)}
    ${offerPanel(campaign, brand, safe, offerY, w - safe * 2, offerH)}
    ${benefitRow(campaign, brand, safe, benefitY, w - safe * 2, benefitH)}
    <text x="${safe}" y="${footerY}" fill="${ink}" font-size="18" font-weight="680" font-family="${sans}">${esc(clean(campaign.cta, 42))} →</text>
    ${legalLine(campaign, brand, w * 0.48, footerY, w * 0.45 - safe, ink)}`;
}
