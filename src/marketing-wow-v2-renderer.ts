import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import {
  baseline,
  brandLockup,
  chooseCandidate,
  clean,
  defs,
  fitText,
  fontFamily,
  preferredVariant,
  qualityPenalty,
  readable,
  text,
  wrapSvg,
} from "./marketing-wow-v2-core";
import {
  editorialCandidates,
  impactCandidates,
  retailCandidates,
  spotlightCandidates,
} from "./marketing-wow-v2-layouts";
import { assertMarketingSvg, isCandidateAcceptable } from "./marketing-wow-v2-validation";

function emergencyFallback(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const safe = Math.max(48, Math.min(96, Math.min(format.width, format.height) * 0.06));
  const ink = readable(brand.background, brand.primary);
  const title = fitText(clean(campaign.headline, 220), format.width - safe * 2, format.height * 0.38, Math.min(96, format.width * 0.09), 28, 850, 0.98);
  const sub = fitText(clean(campaign.subheadline, 320), format.width - safe * 2, format.height * 0.24, Math.min(32, format.width * 0.03), 16, 520, 1.18);
  const body = `${defs(brand)}
    <rect width="${format.width}" height="${format.height}" fill="${brand.background}"/>
    <rect x="${safe}" y="${safe}" width="${Math.max(8, safe * 0.9)}" height="10" rx="5" fill="${brand.accent}"/>
    ${brandLockup(brand, safe, safe + 54, Math.min(260, format.width * 0.28), ink)}
    ${text(title, safe, baseline(format.height * 0.28, title), ink, 850, fontFamily(brand, true))}
    ${text(sub, safe, baseline(format.height * 0.28 + title.height + 48, sub), ink, 520, fontFamily(brand))}
    <text x="${safe}" y="${format.height - safe}" fill="${ink}" opacity="0.55" font-size="13" font-family="Inter,Arial,sans-serif" letter-spacing="1.4">VISUAL CAMPAIGN / SAFE RENDER</text>`;
  return wrapSvg(format, campaign.headline, body, "safe-render");
}

function renderDesign(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const candidates = campaign.template === "impact"
    ? impactCandidates(campaign, brand, format)
    : campaign.template === "spotlight"
      ? spotlightCandidates(campaign, brand, format)
      : campaign.template === "retail"
        ? retailCandidates(campaign, brand, format)
        : editorialCandidates(campaign, brand, format);

  const preferred = preferredVariant(campaign, format);
  const best = chooseCandidate(candidates, preferred);
  const acceptable = candidates.filter(isCandidateAcceptable);
  const chosen = acceptable.length ? chooseCandidate(acceptable, preferred) : best;
  const score = Math.round(qualityPenalty(chosen) * 10) / 10;
  const body = `${chosen.body}<metadata data-quality-score="${score}" data-layout-variant="${chosen.variant}">${chosen.label}</metadata>`;
  const svg = wrapSvg(format, campaign.headline, body, chosen.label);

  try {
    return assertMarketingSvg(svg, format);
  } catch {
    return emergencyFallback(campaign, brand, format);
  }
}

export function renderMarketingSvgV2(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  return renderDesign(campaign, brand, format);
}
