import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat, MarketingMockup } from "./marketing";
import {
  attr,
  chooseCandidate,
  preferredVariant,
  qualityPenalty,
  readable,
  wrapSvg,
} from "./marketing-wow-v2-core";
import {
  editorialCandidates,
  impactCandidates,
  retailCandidates,
  spotlightCandidates,
  zenCandidates,
} from "./marketing-wow-v2-layouts";
import { assertMarketingSvg, isCandidateAcceptable } from "./marketing-wow-v2-validation";

function renderDesign(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const candidates = campaign.template === "impact"
    ? impactCandidates(campaign, brand, format)
    : campaign.template === "spotlight"
      ? spotlightCandidates(campaign, brand, format)
      : campaign.template === "retail"
        ? retailCandidates(campaign, brand, format)
        : campaign.template === "zen"
          ? zenCandidates(campaign, brand, format)
          : editorialCandidates(campaign, brand, format);

  const preferred = preferredVariant(campaign, format);
  const best = chooseCandidate(candidates, preferred);
  const acceptable = candidates.filter(isCandidateAcceptable);
  const chosen = acceptable.length
    ? chooseCandidate(acceptable, preferred)
    : best;

  // Le data-quality permet d'inspecter le choix sans exposer de nouveau contrôle dans l'UI.
  const score = Math.round(qualityPenalty(chosen) * 10) / 10;
  const body = `${chosen.body}<metadata data-quality-score="${score}" data-layout-variant="${chosen.variant}">${chosen.label}</metadata>`;
  return assertMarketingSvg(wrapSvg(format, campaign.headline, body, chosen.label), format);
}

function dataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function mockupImage(design: string, x: number, y: number, w: number, h: number, radius: number, id: string, transform = "") {
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><image href="${attr(dataUrl(design))}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})" ${transform}/>`;
}

function renderMockup(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: Exclude<MarketingMockup, "none">) {
  const design = renderDesign(campaign, brand, format);
  const ink = readable("#EEF2F7", brand.primary);
  const defs = `<defs>
    <linearGradient id="mock-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F7F9FC"/><stop offset="58%" stop-color="#E9EEF5"/><stop offset="100%" stop-color="#DCE3ED"/></linearGradient>
    <linearGradient id="paper" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E9EDF4"/></linearGradient>
    <linearGradient id="ceramic" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#F7F7F8"/><stop offset="45%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#DDE2E9"/></linearGradient>
    <linearGradient id="fabric" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FCFCFC"/><stop offset="100%" stop-color="#E6E9EE"/></linearGradient>
    <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F4E9D7"/><stop offset="100%" stop-color="#DCC9AD"/></linearGradient>
    <filter id="obj-shadow" x="-35%" y="-35%" width="170%" height="190%"><feDropShadow dx="0" dy="30" stdDeviation="30" flood-color="#111827" flood-opacity="0.24"/></filter>
    <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="13" stdDeviation="18" flood-color="#111827" flood-opacity="0.14"/></filter>
  </defs>`;

  let object = "";
  if (mockup === "tshirt") {
    object = `<g filter="url(#obj-shadow)">
      <path d="M350 260 L470 188 L560 244 L650 188 L770 260 L900 430 L770 515 L710 430 L710 1018 Q560 1058 410 1018 L410 430 L350 515 L220 430 Z" fill="url(#fabric)" stroke="#D8DEE7" stroke-width="4"/>
      <path d="M470 188 Q560 300 650 188" fill="#E8EBF0" opacity="0.75"/>
      ${mockupImage(design, 455, 410, 210, 265, 10, "tshirt-art")}
      <path d="M410 430 Q560 470 710 430" fill="none" stroke="#C9D0DA" stroke-width="2" opacity="0.42"/>
    </g>`;
  } else if (mockup === "mug") {
    object = `<g filter="url(#obj-shadow)">
      <ellipse cx="555" cy="790" rx="270" ry="44" fill="#111827" opacity="0.08"/>
      <rect x="285" y="350" width="525" height="440" rx="92" fill="url(#ceramic)" stroke="#D5DBE4" stroke-width="4"/>
      <path d="M805 444 C1035 405 1042 731 805 708" fill="none" stroke="#E5E9EF" stroke-width="82"/>
      <path d="M807 460 C957 438 963 688 807 684" fill="none" stroke="#C9D0DA" stroke-width="13" opacity="0.55"/>
      ${mockupImage(design, 360, 425, 375, 295, 28, "mug-art")}
      <path d="M335 392 Q510 350 700 390" fill="none" stroke="#FFFFFF" stroke-width="13" opacity="0.48"/>
    </g>`;
  } else if (mockup === "tote") {
    object = `<g filter="url(#obj-shadow)">
      <path d="M318 355 Q560 292 802 355 L850 1008 Q560 1058 270 1008 Z" fill="url(#kraft)" stroke="#D2C0A4" stroke-width="4"/>
      <path d="M414 390 C414 154 706 154 706 390" fill="none" stroke="#CAB797" stroke-width="35"/>
      <path d="M435 392 C435 195 685 195 685 392" fill="none" stroke="#F4E9D7" stroke-width="10" opacity="0.65"/>
      ${mockupImage(design, 375, 468, 370, 465, 12, "tote-art")}
    </g>`;
  } else if (mockup === "packaging") {
    object = `<g filter="url(#obj-shadow)">
      <polygon points="300,350 690,270 875,385 485,470" fill="#F4F7FA"/>
      <polygon points="690,270 875,385 875,940 690,825" fill="#DDE4ED"/>
      <rect x="300" y="350" width="390" height="555" fill="url(#paper)"/>
      ${mockupImage(design, 326, 382, 338, 492, 6, "pack-art")}
      <line x1="690" y1="270" x2="690" y2="825" stroke="#C7CFDA" stroke-width="3"/>
      <path d="M715 330 L845 410 L845 875 L715 795 Z" fill="${brand.accent}" opacity="0.12"/>
    </g>`;
  } else if (mockup === "rollup") {
    object = `<g filter="url(#obj-shadow)">
      <rect x="365" y="105" width="390" height="985" rx="8" fill="#FFFFFF"/>
      ${mockupImage(design, 382, 122, 356, 944, 3, "rollup-art")}
      <rect x="326" y="1088" width="468" height="39" rx="14" fill="#303846"/>
      <path d="M560 1127 L560 1190 M438 1190 L682 1190" stroke="#303846" stroke-width="13" stroke-linecap="round"/>
      <rect x="390" y="95" width="340" height="10" rx="5" fill="#5B6574"/>
    </g>`;
  } else {
    object = `<g filter="url(#obj-shadow)">
      <rect x="140" y="120" width="840" height="1010" rx="28" fill="#CBD3DF"/>
      <rect x="185" y="166" width="750" height="918" rx="12" fill="#F9FBFD"/>
      ${mockupImage(design, 225, 215, 670, 820, 6, "store-art")}
      <line x1="560" y1="166" x2="560" y2="1084" stroke="#B7C0CE" stroke-width="9"/>
      <rect x="160" y="1084" width="800" height="35" fill="#AEB8C7"/>
      <ellipse cx="560" cy="1160" rx="390" ry="45" fill="#111827" opacity="0.07"/>
    </g>`;
  }

  const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1280" viewBox="0 0 1200 1280" role="img" aria-label="Mockup ${attr(mockup)}">
    ${defs}
    <rect width="1200" height="1280" fill="url(#mock-bg)"/>
    <circle cx="1040" cy="170" r="190" fill="${brand.accent}" opacity="0.1"/>
    <circle cx="150" cy="1120" r="120" fill="none" stroke="${ink}" stroke-width="2" opacity="0.08"/>
    <text x="70" y="82" fill="#5E6878" font-size="15" font-weight="850" letter-spacing="2.8" font-family="Inter,Arial,sans-serif">CAMPAIGN MOCKUP / ${attr(mockup.toUpperCase())}</text>
    ${object}
  </svg>`;
  return mockSvg;
}

export function renderMarketingSvgV2(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: MarketingMockup = "none") {
  return mockup === "none" ? renderDesign(campaign, brand, format) : renderMockup(campaign, brand, format, mockup);
}
