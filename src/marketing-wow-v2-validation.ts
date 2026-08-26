import type { BrandProfile } from "./types";
import type { MarketingCampaign, MarketingFormat, MarketingTemplate } from "./marketing";
import type { RenderCandidate } from "./marketing-wow-v2-core";
import { qualityPenalty } from "./marketing-wow-v2-core";

export type SvgValidation = {
  valid: boolean;
  errors: string[];
};

export type BaselineCase = {
  id: string;
  campaign: MarketingCampaign;
};

export const baselineCases: BaselineCase[] = [
  {
    id: "short",
    campaign: {
      name: "Lancement",
      objective: "launch",
      target: "Dirigeants de PME",
      offer: "Une solution claire pour accélérer les décisions.",
      headline: "Décidez plus vite.",
      subheadline: "Transformez une idée complexe en campagne immédiatement compréhensible.",
      benefits: ["Clarté immédiate", "Marque cohérente", "Déclinaisons rapides"],
      cta: "Découvrir",
      tone: "premium",
      template: "editorial",
    },
  },
  {
    id: "medium",
    campaign: {
      name: "Offre premium",
      objective: "sell",
      target: "Dirigeants et responsables marketing",
      offer: "Un accompagnement premium, lisible et directement actionnable.",
      headline: "Une campagne qui mérite vraiment votre marque.",
      subheadline: "Une direction visuelle forte, une promesse claire et une exécution prête à publier sur chaque canal.",
      benefits: ["Direction créative", "Hiérarchie marketing", "Formats adaptés"],
      cta: "Voir l'offre",
      badge: "Nouveau",
      tone: "premium",
      template: "editorial",
    },
  },
  {
    id: "long",
    campaign: {
      name: "Transformation",
      objective: "announce",
      target: "Comités de direction de TPE et PME",
      offer: "Une méthode de communication qui transforme une proposition complexe en message structuré, lisible et mémorisable.",
      headline: "Faites comprendre votre proposition de valeur avant même que votre audience ait le temps de faire défiler la page.",
      subheadline: "Le visuel doit rester lisible, équilibré et crédible même lorsque le message est plus long que la moyenne et comporte plusieurs niveaux d'information.",
      benefits: ["Promesse immédiatement lisible", "Information hiérarchisée sans surcharge", "Aucune ligne coupée"],
      cta: "Découvrir la méthode",
      badge: "Édition 2026",
      legal: "Exemple de validation interne. Les résultats réels dépendent du contenu et du canal de diffusion.",
      tone: "editorial",
      template: "editorial",
    },
  },
  {
    id: "retail",
    campaign: {
      name: "Promo",
      objective: "sell",
      target: "Clients magasin et e-commerce",
      offer: "Pack de lancement disponible cette semaine dans la limite des stocks disponibles.",
      headline: "L'offre de lancement qui change la donne.",
      subheadline: "Une proposition simple à comprendre, un avantage visible et une action immédiate.",
      benefits: ["Livraison rapide", "Garantie incluse", "Support prioritaire"],
      cta: "J'en profite",
      price: "49 €",
      badge: "-20 %",
      legal: "Offre valable selon conditions.",
      tone: "retail",
      template: "retail",
    },
  },
];

export function validateSvg(svg: string, format: MarketingFormat): SvgValidation {
  const errors: string[] = [];
  if (!svg.startsWith("<svg")) errors.push("racine SVG absente");
  if (!svg.includes(`width=\"${format.width}\"`)) errors.push("largeur incohérente");
  if (!svg.includes(`height=\"${format.height}\"`)) errors.push("hauteur incohérente");
  if (!svg.includes(`viewBox=\"0 0 ${format.width} ${format.height}\"`)) errors.push("viewBox incohérent");
  if (/NaN|undefined|Infinity/.test(svg)) errors.push("valeur numérique invalide");
  if (/\b(?:width|height|r|rx|ry)=\"-\d/.test(svg)) errors.push("dimension negative explicite");
  if (/<text[^>]*>\s*<\/text>/.test(svg)) errors.push("texte vide");
  return { valid: errors.length === 0, errors };
}

export function isCandidateAcceptable(candidate: RenderCandidate) {
  const m = candidate.metrics;
  return qualityPenalty(candidate) < 78
    && !m.textOverflow
    && m.titleRatio <= 0.38
    && m.heroRatio >= 0.2
    && m.deadZone <= 0.3
    && m.density <= 0.76;
}

export function assertMarketingSvg(svg: string, format: MarketingFormat) {
  const validation = validateSvg(svg, format);
  if (!validation.valid) {
    throw new Error(`Rendu marketing invalide : ${validation.errors.join(", ")}`);
  }
  return svg;
}

export function validationMatrix(brand: BrandProfile, formats: MarketingFormat[]) {
  const templates: MarketingTemplate[] = ["editorial", "impact", "spotlight", "retail"];
  return baselineCases.flatMap((entry) => templates.flatMap((template) => formats.map((format) => ({
    id: `${entry.id}:${template}:${format.id}`,
    brand,
    campaign: { ...entry.campaign, template },
    format,
  }))));
}
