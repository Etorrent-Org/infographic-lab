export {
  campaignCopyMarkdown,
  defaultMarketingCampaign,
  marketingFormats,
  objectiveOptions,
  renderMarketingSvg,
  svgStringToDataUrl,
  svgStringToRaster,
  templateOptions,
  toneOptions,
} from "./marketing";

export type {
  MarketingCampaign,
  MarketingFormatId,
  MarketingTemplate,
} from "./marketing";

export { buildMarketingBaselineReport, assertMarketingBaseline } from "./marketing-wow-v2-baseline";
