import type { BrandProfile } from "./types";
import { renderMarketingSvgV2 } from "./marketing-wow-v2-renderer";

export type MarketingObjective = "sell" | "launch" | "announce" | "recruit" | "event" | "educate";
export type MarketingTone = "premium" | "editorial" | "bold" | "tech" | "zen" | "retail";
export type MarketingTemplate = "editorial" | "impact" | "spotlight" | "retail" | "zen";
export type MarketingMockup = "none" | "tshirt" | "mug" | "tote" | "packaging" | "rollup" | "storefront";
export type MarketingFormatId = "linkedin-portrait" | "square" | "story" | "banner" | "a4" | "poster" | "product-card" | "rollup";

export type MarketingFormat = {
  id: MarketingFormatId;
  label: string;
  category: "social" | "print" | "retail";
  width: number;
  height: number;
  hint: string;
};

export type MarketingCampaign = {
  name: string;
  objective: MarketingObjective;
  target: string;
  offer: string;
  headline: string;
  subheadline: string;
  benefits: string[];
  cta: string;
  price?: string;
  badge?: string;
  legal?: string;
  tone: MarketingTone;
  template: MarketingTemplate;
  assetDataUrl?: string;
  assetName?: string;
};

export const marketingFormats: MarketingFormat[] = [
  { id: "linkedin-portrait", label: "LinkedIn portrait", category: "social", width: 1080, height: 1350, hint: "1080 × 1350" },
  { id: "square", label: "Post carré", category: "social", width: 1080, height: 1080, hint: "1080 × 1080" },
  { id: "story", label: "Story", category: "social", width: 1080, height: 1920, hint: "1080 × 1920" },
  { id: "banner", label: "Bannière", category: "social", width: 1200, height: 628, hint: "1200 × 628" },
  { id: "a4", label: "Flyer A4", category: "print", width: 1240, height: 1754, hint: "A4 portrait" },
  { id: "poster", label: "Affiche", category: "print", width: 1400, height: 2000, hint: "Affiche portrait" },
  { id: "product-card", label: "Fiche produit", category: "retail", width: 1400, height: 1800, hint: "Produit / offre" },
  { id: "rollup", label: "Kakemono", category: "retail", width: 1200, height: 3000, hint: "Roll-up vertical" },
];

export const templateOptions: { id: MarketingTemplate; label: string; hint: string }[] = [
  { id: "editorial", label: "Editorial Luxe", hint: "premium, respiration, typographie" },
  { id: "impact", label: "Campaign Impact", hint: "fort contraste, accroche massive" },
  { id: "spotlight", label: "Product Spotlight", hint: "produit au centre de la scène" },
  { id: "retail", label: "Retail Promo", hint: "offre, prix, merchandising" },
  { id: "zen", label: "Zen Minimal", hint: "sobre, élégant, très lisible" },
];

export const mockupOptions: { id: MarketingMockup; label: string }[] = [
  { id: "none", label: "Visuel seul" },
  { id: "tshirt", label: "T-shirt" },
  { id: "mug", label: "Mug" },
  { id: "tote", label: "Tote bag" },
  { id: "packaging", label: "Packaging" },
  { id: "rollup", label: "Kakemono" },
  { id: "storefront", label: "Vitrine / affiche" },
];

export const objectiveOptions: { id: MarketingObjective; label: string }[] = [
  { id: "sell", label: "Vendre" },
  { id: "launch", label: "Lancer" },
  { id: "announce", label: "Annoncer" },
  { id: "recruit", label: "Recruter" },
  { id: "event", label: "Événement" },
  { id: "educate", label: "Expliquer" },
];

export const toneOptions: { id: MarketingTone; label: string }[] = [
  { id: "premium", label: "Premium" },
  { id: "editorial", label: "Éditorial" },
  { id: "bold", label: "Punchy" },
  { id: "tech", label: "Tech" },
  { id: "zen", label: "Zen" },
  { id: "retail", label: "Retail" },
];

export const defaultMarketingCampaign: MarketingCampaign = {
  name: "Nouvelle campagne",
  objective: "launch",
  target: "Dirigeants de TPE / PME",
  offer: "Une offre claire, utile et immédiatement compréhensible.",
  headline: "Faites passer votre idée au premier plan.",
  subheadline: "Un visuel prêt à publier, fidèle à votre marque et adapté à chaque canal.",
  benefits: ["Message clair", "Identité cohérente", "Déclinaisons immédiates"],
  cta: "Découvrir",
  tone: "premium",
  template: "editorial",
};

export function renderMarketingSvg(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: MarketingMockup = "none") {
  return renderMarketingSvgV2(campaign, brand, format, mockup);
}

export function svgStringToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function svgStringToRaster(svg: string, mime: "image/png" | "image/jpeg", quality = 0.94) {
  const image = new Image();
  const url = svgStringToDataUrl(svg);
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Impossible de rasteriser le visuel."));
    image.src = url;
  });
  const width = image.naturalWidth || image.width || 1200;
  const height = image.naturalHeight || image.height || 1200;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponible.");
  if (mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL(mime, quality);
}

export function campaignCopyMarkdown(campaign: MarketingCampaign) {
  return `# ${campaign.name}\n\n## Accroche\n${campaign.headline}\n\n## Sous-accroche\n${campaign.subheadline}\n\n## Bénéfices\n${campaign.benefits.filter(Boolean).map((item) => `- ${item}`).join("\n")}\n\n## CTA\n${campaign.cta}\n${campaign.price ? `\n## Prix / offre\n${campaign.price}\n` : ""}${campaign.badge ? `\n## Badge\n${campaign.badge}\n` : ""}${campaign.legal ? `\n## Mention\n${campaign.legal}\n` : ""}\n## Cible\n${campaign.target}\n\n## Offre\n${campaign.offer}\n`;
}
