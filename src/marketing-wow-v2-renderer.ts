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
  type RenderCandidate,
} from "./marketing-wow-v2-core";
import {
  editorialCandidates,
  impactCandidates,
  retailCandidates,
  spotlightCandidates,
} from "./marketing-wow-v2-layouts";
import { assertMarketingSvg, isCandidateAcceptable } from "./marketing-wow-v2-validation";

function structuralScore(candidate: RenderCandidate) {
  return Math.max(0, Math.min(10, 10 - qualityPenalty(candidate) / 40));
}

function emergencyFallback(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const safe = Math.max(48, Math.min(96, Math.min(format.width, format.height) * 0.06));
  const ink = readable(brand.background, brand.primary);
  const title = fitText(clean(campaign.headline, 220), format.width - safe * 2, format.height * 0.34, Math.min(88, format.width * 0.082), 26, 850, 0.98);
  const sub = fitText(clean(campaign.subheadline, 320), format.width - safe * 2, format.height * 0.2, Math.min(30, format.width * 0.028), 15, 520, 1.18);
  const target = fitText(clean(campaign.target, 120), format.width - safe * 2, 36, 14, 10, 720, 1);
  const body = `${defs(brand)}
    <rect width="${format.width}" height="${format.height}" fill="${brand.background}"/>
    <rect x="0" y="0" width="${Math.max(84, format.width * 0.12)}" height="${format.height}" fill="${brand.primary}"/>
    <rect x="${Math.max(84, format.width * 0.12) - 6}" y="${safe}" width="12" height="${format.height - safe * 2}" rx="6" fill="${brand.accent}"/>
    ${brandLockup(brand, safe + Math.max(84, format.width * 0.12), safe + 30, Math.min(250, format.width * 0.26), ink)}
    ${text(target, safe + Math.max(84, format.width * 0.12), baseline(safe + 82, target), ink, 720, fontFamily(brand))}
    ${text(title, safe + Math.max(84, format.width * 0.12), baseline(format.height * 0.27, title), ink, 850, fontFamily(brand, true))}
    ${text(sub, safe + Math.max(84, format.width * 0.12), baseline(format.height * 0.27 + title.height + 46, sub), ink, 520, fontFamily(brand))}
    <text x="${format.width - safe}" y="${format.height - safe}" text-anchor="end" fill="${ink}" opacity="0.48" font-size="12" font-family="Inter,Arial,sans-serif" letter-spacing="1.4">SAFE COMPOSITION</text>`;
  return wrapSvg(format, campaign.headline, body, "safe-composition");
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
  const acceptable = candidates.filter(isCandidateAcceptable);
  const ready = acceptable.filter((candidate) => structuralScore(candidate) >= 8);
  const pool = ready.length ? ready : acceptable.length ? acceptable : candidates;
  const chosen = chooseCandidate(pool, preferred);

  if (!chosen || !isCandidateAcceptable(chosen)) {
    return emergencyFallback(campaign, brand, format);
  }

  const penalty = Math.round(qualityPenalty(chosen) * 10) / 10;
  const score = Math.round(structuralScore(chosen) * 10) / 10;
  const body = `${chosen.body}<metadata data-quality-penalty="${penalty}" data-structure-score="${score}" data-layout-variant="${chosen.variant}">${chosen.label}</metadata>`;
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
