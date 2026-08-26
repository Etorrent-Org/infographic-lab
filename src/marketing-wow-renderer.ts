import type { BrandProfile } from "./types";
import { svgStringToDataUrl, type MarketingCampaign, type MarketingFormat, type MarketingMockup } from "./marketing";
import { attr, esc } from "./marketing-wow-core";
import { renderDesign } from "./marketing-wow-design";

function renderMockup(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: Exclude<MarketingMockup, "none">) {
  const design = svgStringToDataUrl(renderDesign(campaign, brand, format));
  const image = (x: number, y: number, w: number, h: number, radius = 0, id = "mockup-clip") => `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><image href="${attr(design)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
  let object = "";

  if (mockup === "tshirt") {
    object = `<g filter="url(#mock-shadow)"><path d="M335 260 L468 186 L555 244 L645 186 L782 260 L900 430 L760 520 L705 438 L705 1040 L415 1040 L415 438 L360 520 L220 430 Z" fill="#F8FAFC" stroke="#D9DFE9" stroke-width="4"/>${image(465, 425, 190, 238, 12, "shirt-clip")}</g>`;
  } else if (mockup === "mug") {
    object = `<g filter="url(#mock-shadow)"><rect x="300" y="360" width="500" height="430" rx="82" fill="#FCFCFD" stroke="#D9DFE9" stroke-width="4"/><path d="M800 445 C1015 415 1018 720 800 705" fill="none" stroke="#E7EBF1" stroke-width="76"/>${image(365, 425, 370, 300, 24, "mug-clip")}</g>`;
  } else if (mockup === "tote") {
    object = `<g filter="url(#mock-shadow)"><path d="M318 350 Q560 295 802 350 L850 1000 Q560 1050 270 1000 Z" fill="#F3EBDD" stroke="#D9CDBA" stroke-width="4"/><path d="M415 390 C415 155 705 155 705 390" fill="none" stroke="#D9CDBA" stroke-width="34"/>${image(380, 475, 360, 450, 14, "tote-clip")}</g>`;
  } else if (mockup === "packaging") {
    object = `<g filter="url(#mock-shadow)"><polygon points="315,350 685,275 865,390 495,470" fill="#EFF3F8"/><polygon points="685,275 865,390 865,930 685,815" fill="#DCE3ED"/><rect x="315" y="350" width="370" height="540" fill="#FFFFFF"/>${image(340, 380, 320, 480, 6, "pack-clip")}</g>`;
  } else if (mockup === "rollup") {
    object = `<g filter="url(#mock-shadow)"><rect x="382" y="122" width="356" height="955" rx="8" fill="#fff"/>${image(398, 138, 324, 914, 3, "rollup-clip")}<rect x="338" y="1077" width="444" height="36" rx="13" fill="#343B49"/><line x1="560" y1="1113" x2="560" y2="1180" stroke="#343B49" stroke-width="12"/></g>`;
  } else {
    object = `<g filter="url(#mock-shadow)"><rect x="165" y="135" width="790" height="980" rx="22" fill="#D9DFE8"/><rect x="212" y="182" width="696" height="886" rx="10" fill="#FBFCFE"/>${image(250, 230, 620, 790, 5, "store-clip")}<line x1="560" y1="182" x2="560" y2="1068" stroke="#C4CCD8" stroke-width="9"/></g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1280" viewBox="0 0 1200 1280" role="img" aria-label="Mockup ${attr(mockup)}">
    <defs>
      <linearGradient id="mock-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F6F8FB"/><stop offset="100%" stop-color="#E5EAF2"/></linearGradient>
      <filter id="mock-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#111827" flood-opacity="0.2"/></filter>
    </defs>
    <rect width="1200" height="1280" fill="url(#mock-bg)"/>
    <circle cx="1030" cy="190" r="190" fill="${brand.accent}" opacity="0.1"/>
    <circle cx="145" cy="1110" r="120" fill="none" stroke="${brand.primary}" stroke-width="2" opacity="0.1"/>
    <text x="70" y="86" fill="#667085" font-size="16" font-weight="850" letter-spacing="2.6" font-family="Inter,Arial,sans-serif">CAMPAIGN MOCKUP · ${esc(mockup.toUpperCase())}</text>
    ${object}
  </svg>`;
}

export function renderMarketingSvg(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: MarketingMockup = "none") {
  return mockup === "none" ? renderDesign(campaign, brand, format) : renderMockup(campaign, brand, format, mockup);
}
