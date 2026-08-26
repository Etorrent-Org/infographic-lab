import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat } from "./marketing";
import { attr } from "./marketing-wow-core";
import { renderEditorial } from "./marketing-wow-editorial";
import { renderImpact } from "./marketing-wow-impact";
import { renderRetail } from "./marketing-wow-retail";
import { renderSpotlight } from "./marketing-wow-spotlight";
import { renderZen } from "./marketing-wow-zen";

export function renderDesign(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const body = campaign.template === "impact"
    ? renderImpact(campaign, brand, format)
    : campaign.template === "spotlight"
      ? renderSpotlight(campaign, brand, format)
      : campaign.template === "retail"
        ? renderRetail(campaign, brand, format)
        : campaign.template === "zen"
          ? renderZen(campaign, brand, format)
          : renderEditorial(campaign, brand, format);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${format.width}" height="${format.height}" viewBox="0 0 ${format.width} ${format.height}" role="img" aria-label="${attr(campaign.headline)}" overflow="hidden">${body}</svg>`;
}
