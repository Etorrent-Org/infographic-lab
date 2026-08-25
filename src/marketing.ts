import type { BrandProfile } from "./types";

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

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function attr(value: string) {
  return esc(value).replace(/\n/g, " ");
}

function clampText(value: string, max = 180) {
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}

function wrap(value: string, maxChars: number, maxLines: number) {
  const words = clampText(value, maxChars * maxLines * 2).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]$/, "")}…`;
  return lines;
}

function textLines(lines: string[], x: number, y: number, fontSize: number, lineHeight: number, fill: string, weight = 700, anchor: "start" | "middle" | "end" = "start", family = "Inter,Arial,sans-serif") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${fontSize}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join("")}</text>`;
}

function brandLockup(brand: BrandProfile, x: number, y: number, width: number, color: string) {
  if (brand.logoDataUrl) {
    return `<image href="${attr(brand.logoDataUrl)}" x="${x}" y="${y - 26}" width="${width}" height="52" preserveAspectRatio="xMinYMid meet" />`;
  }
  return `<text x="${x}" y="${y}" fill="${color}" font-size="20" font-weight="800" letter-spacing="1.5" font-family="Inter,Arial,sans-serif">${esc(brand.name)}</text>`;
}

function productImage(campaign: MarketingCampaign, x: number, y: number, w: number, h: number, radius: number, id: string) {
  if (!campaign.assetDataUrl) return "";
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" /></clipPath></defs><image href="${attr(campaign.assetDataUrl)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})" />`;
}

function renderEditorial(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const { width: w, height: h } = format;
  const landscape = w / h > 1.25;
  const pad = Math.round(Math.min(w, h) * 0.07);
  const accent = brand.accent;
  const ink = brand.primary;
  const bg = brand.background;
  const headlineSize = Math.round(Math.min(w * (landscape ? 0.066 : 0.085), h * 0.09));
  const headlineX = pad;
  const headlineY = landscape ? h * 0.33 : h * 0.29;
  const headlineWidth = landscape ? Math.floor(w * 0.44) : Math.floor(w * 0.76);
  const maxChars = Math.max(16, Math.floor(headlineWidth / (headlineSize * 0.56)));
  const lines = wrap(campaign.headline, maxChars, landscape ? 3 : 4);
  const imageX = landscape ? w * 0.57 : w * 0.58;
  const imageY = landscape ? h * 0.13 : h * 0.48;
  const imageW = landscape ? w * 0.36 : w * 0.34;
  const imageH = landscape ? h * 0.74 : h * 0.36;
  const subY = headlineY + lines.length * headlineSize * 1.06 + headlineSize * 0.25;
  const subLines = wrap(campaign.subheadline, landscape ? 58 : 48, 3);
  const benefitY = landscape ? h * 0.76 : h * 0.86;

  return `<rect width="${w}" height="${h}" fill="${bg}" />
    <circle cx="${w * 0.84}" cy="${h * 0.16}" r="${Math.min(w, h) * 0.19}" fill="${accent}" opacity="0.11" />
    <rect x="${pad}" y="${pad * 1.05}" width="6" height="${Math.min(82, h * 0.08)}" rx="3" fill="${accent}" />
    ${brandLockup(brand, pad + 20, pad * 1.45, Math.min(150, w * 0.16), ink)}
    ${campaign.badge ? `<rect x="${pad}" y="${headlineY - headlineSize * 0.8}" width="${Math.min(w * 0.32, campaign.badge.length * headlineSize * 0.28 + 48)}" height="${headlineSize * 0.52}" rx="${headlineSize * 0.26}" fill="${accent}" /><text x="${pad + 22}" y="${headlineY - headlineSize * 0.45}" fill="#fff" font-size="${headlineSize * 0.22}" font-weight="800" letter-spacing="1" font-family="Inter,Arial,sans-serif">${esc(campaign.badge.toUpperCase())}</text>` : ""}
    ${textLines(lines, headlineX, headlineY, headlineSize, headlineSize * 1.06, ink, 780, "start", brand.fontFamily === "serif" ? "Georgia,serif" : "Inter,Arial,sans-serif")}
    ${textLines(subLines, headlineX, subY, Math.round(headlineSize * 0.31), Math.round(headlineSize * 0.44), ink, 450)}
    ${campaign.assetDataUrl ? productImage(campaign, imageX, imageY, imageW, imageH, Math.min(36, w * 0.025), "editorial-product") : `<rect x="${imageX}" y="${imageY}" width="${imageW}" height="${imageH}" rx="${Math.min(36, w * 0.025)}" fill="${ink}" opacity="0.06" /><circle cx="${imageX + imageW * 0.5}" cy="${imageY + imageH * 0.42}" r="${Math.min(imageW, imageH) * 0.25}" fill="${accent}" opacity="0.32" /><path d="M ${imageX + imageW * 0.22} ${imageY + imageH * 0.7} Q ${imageX + imageW * 0.5} ${imageY + imageH * 0.42} ${imageX + imageW * 0.78} ${imageY + imageH * 0.7}" stroke="${ink}" stroke-width="4" fill="none" opacity="0.3" />`}
    <g>${campaign.benefits.slice(0, 3).map((benefit, index) => `<g transform="translate(${pad + index * ((w - pad * 2) / 3)},${benefitY})"><circle cx="7" cy="-4" r="7" fill="${accent}" /><text x="24" y="0" fill="${ink}" font-size="${Math.max(14, Math.min(22, w * 0.019))}" font-weight="650" font-family="Inter,Arial,sans-serif">${esc(clampText(benefit, 34))}</text></g>`).join("")}</g>
    <rect x="${pad}" y="${h - pad - 54}" width="${Math.min(w * 0.32, 300)}" height="54" rx="27" fill="${ink}" /><text x="${pad + Math.min(w * 0.32, 300) / 2}" y="${h - pad - 19}" fill="#fff" font-size="18" font-weight="800" text-anchor="middle" font-family="Inter,Arial,sans-serif">${esc(campaign.cta)}</text>
    ${campaign.legal ? `<text x="${w - pad}" y="${h - pad + 2}" fill="${ink}" opacity="0.56" font-size="11" text-anchor="end" font-family="Inter,Arial,sans-serif">${esc(clampText(campaign.legal, 100))}</text>` : ""}`;
}

function renderImpact(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const { width: w, height: h } = format;
  const pad = Math.round(Math.min(w, h) * 0.07);
  const ink = brand.primary;
  const accent = brand.accent;
  const bg = ink;
  const headlineSize = Math.round(Math.min(w * 0.105, h * 0.095));
  const lines = wrap(campaign.headline, Math.max(14, Math.floor((w - pad * 2) / (headlineSize * 0.55))), 4);
  const headlineY = h * 0.28;
  const imageW = w * 0.45;
  const imageH = h * 0.42;
  const imageX = w - pad - imageW;
  const imageY = h * 0.49;
  return `<rect width="${w}" height="${h}" fill="${bg}" />
    <circle cx="${w * 0.86}" cy="${h * 0.15}" r="${Math.min(w, h) * 0.28}" fill="none" stroke="${accent}" stroke-width="${Math.max(18, w * 0.032)}" opacity="0.8" />
    <path d="M0 ${h * 0.78} L${w} ${h * 0.55} L${w} ${h} L0 ${h}Z" fill="${accent}" opacity="0.18" />
    ${brandLockup(brand, pad, pad * 1.5, 160, "#fff")}
    ${campaign.badge ? `<text x="${pad}" y="${h * 0.18}" fill="${accent}" font-size="${Math.max(16, w * 0.018)}" font-weight="850" letter-spacing="2" font-family="Inter,Arial,sans-serif">${esc(campaign.badge.toUpperCase())}</text>` : ""}
    ${textLines(lines, pad, headlineY, headlineSize, headlineSize * 0.96, "#fff", 860)}
    ${campaign.assetDataUrl ? productImage(campaign, imageX, imageY, imageW, imageH, 28, "impact-product") : ""}
    ${textLines(wrap(campaign.subheadline, 54, 3), pad, h * 0.67, Math.max(17, headlineSize * 0.24), Math.max(25, headlineSize * 0.34), "#fff", 450)}
    <rect x="${pad}" y="${h - pad - 62}" width="${Math.min(330, w * 0.36)}" height="62" rx="31" fill="${accent}" /><text x="${pad + Math.min(330, w * 0.36) / 2}" y="${h - pad - 22}" fill="${ink}" font-size="20" font-weight="900" text-anchor="middle" font-family="Inter,Arial,sans-serif">${esc(campaign.cta)}</text>`;
}

function renderSpotlight(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const { width: w, height: h } = format;
  const pad = Math.round(Math.min(w, h) * 0.065);
  const ink = brand.primary;
  const accent = brand.accent;
  const bg = brand.background;
  const productW = w * 0.58;
  const productH = h * 0.52;
  const productX = (w - productW) / 2;
  const productY = h * 0.25;
  const headlineSize = Math.round(Math.min(w * 0.075, h * 0.065));
  return `<defs><radialGradient id="spotlight-bg" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="${accent}" stop-opacity="0.25"/><stop offset="70%" stop-color="${bg}" stop-opacity="1"/></radialGradient><filter id="soft-shadow"><feDropShadow dx="0" dy="24" stdDeviation="28" flood-opacity="0.22"/></filter></defs>
    <rect width="${w}" height="${h}" fill="url(#spotlight-bg)" />
    ${brandLockup(brand, pad, pad * 1.45, 150, ink)}
    ${textLines(wrap(campaign.headline, 36, 3), pad, h * 0.16, headlineSize, headlineSize * 1.02, ink, 820)}
    ${campaign.assetDataUrl ? `<g filter="url(#soft-shadow)">${productImage(campaign, productX, productY, productW, productH, Math.min(52, w * 0.05), "spotlight-product")}</g>` : `<ellipse cx="${w / 2}" cy="${productY + productH * 0.78}" rx="${productW * 0.34}" ry="${productH * 0.08}" fill="${ink}" opacity="0.12"/><rect x="${productX + productW * 0.28}" y="${productY + productH * 0.12}" width="${productW * 0.44}" height="${productH * 0.65}" rx="${productW * 0.08}" fill="${ink}" opacity="0.82"/>`}
    <g transform="translate(${pad},${h * 0.82})">${campaign.benefits.slice(0, 3).map((benefit, index) => `<g transform="translate(${index * ((w - pad * 2) / 3)},0)"><text x="0" y="0" fill="${accent}" font-size="14" font-weight="900" font-family="Inter,Arial,sans-serif">0${index + 1}</text><text x="0" y="32" fill="${ink}" font-size="${Math.max(14, w * 0.017)}" font-weight="700" font-family="Inter,Arial,sans-serif">${esc(clampText(benefit, 28))}</text></g>`).join("")}</g>
    <rect x="${w - pad - Math.min(300, w * 0.32)}" y="${h - pad - 58}" width="${Math.min(300, w * 0.32)}" height="58" rx="29" fill="${ink}" /><text x="${w - pad - Math.min(300, w * 0.32) / 2}" y="${h - pad - 21}" fill="#fff" font-size="18" font-weight="800" text-anchor="middle" font-family="Inter,Arial,sans-serif">${esc(campaign.cta)}</text>`;
}

function renderRetail(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const { width: w, height: h } = format;
  const pad = Math.round(Math.min(w, h) * 0.06);
  const ink = brand.primary;
  const accent = brand.accent;
  const bg = brand.background;
  const headlineSize = Math.round(Math.min(w * 0.085, h * 0.07));
  const price = campaign.price?.trim() || "OFFRE";
  return `<rect width="${w}" height="${h}" fill="${bg}" />
    <rect x="0" y="0" width="${w}" height="${h * 0.22}" fill="${ink}" />
    ${brandLockup(brand, pad, h * 0.105, 160, "#fff")}
    ${campaign.badge ? `<rect x="${w - pad - 190}" y="${h * 0.06}" width="190" height="48" rx="24" fill="${accent}"/><text x="${w - pad - 95}" y="${h * 0.06 + 31}" text-anchor="middle" fill="${ink}" font-size="15" font-weight="900" font-family="Inter,Arial,sans-serif">${esc(campaign.badge.toUpperCase())}</text>` : ""}
    ${textLines(wrap(campaign.headline, 32, 3), pad, h * 0.33, headlineSize, headlineSize * 1.02, ink, 860)}
    ${campaign.assetDataUrl ? productImage(campaign, w * 0.46, h * 0.39, w * 0.46, h * 0.39, 32, "retail-product") : `<rect x="${w * 0.46}" y="${h * 0.39}" width="${w * 0.46}" height="${h * 0.39}" rx="32" fill="${ink}" opacity="0.06"/>`}
    <circle cx="${w * 0.25}" cy="${h * 0.59}" r="${Math.min(w, h) * 0.14}" fill="${accent}"/><text x="${w * 0.25}" y="${h * 0.6}" fill="${ink}" font-size="${Math.min(w * 0.08, 82)}" font-weight="950" text-anchor="middle" font-family="Inter,Arial,sans-serif">${esc(price)}</text>
    ${textLines(wrap(campaign.subheadline, 38, 3), pad, h * 0.78, Math.max(16, w * 0.02), Math.max(24, w * 0.029), ink, 520)}
    <rect x="${pad}" y="${h - pad - 62}" width="${Math.min(320, w * 0.34)}" height="62" rx="10" fill="${ink}"/><text x="${pad + Math.min(320, w * 0.34) / 2}" y="${h - pad - 22}" fill="#fff" font-size="20" font-weight="900" text-anchor="middle" font-family="Inter,Arial,sans-serif">${esc(campaign.cta)}</text>`;
}

function renderZen(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const { width: w, height: h } = format;
  const pad = Math.round(Math.min(w, h) * 0.08);
  const ink = brand.primary;
  const accent = brand.accent;
  const bg = brand.background;
  const headlineSize = Math.round(Math.min(w * 0.082, h * 0.065));
  return `<rect width="${w}" height="${h}" fill="${bg}"/>
    <circle cx="${w * 0.84}" cy="${h * 0.18}" r="${Math.min(w, h) * 0.14}" fill="${accent}" opacity="0.2"/>
    <circle cx="${w * 0.12}" cy="${h * 0.82}" r="${Math.min(w, h) * 0.1}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.16"/>
    ${brandLockup(brand, pad, pad * 1.25, 140, ink)}
    <line x1="${pad}" y1="${h * 0.24}" x2="${pad + 72}" y2="${h * 0.24}" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
    ${textLines(wrap(campaign.headline, 34, 4), pad, h * 0.34, headlineSize, headlineSize * 1.08, ink, 650, "start", "Georgia,serif")}
    ${textLines(wrap(campaign.subheadline, 50, 4), pad, h * 0.65, Math.max(17, headlineSize * 0.27), Math.max(28, headlineSize * 0.4), ink, 430)}
    ${campaign.assetDataUrl ? productImage(campaign, w * 0.62, h * 0.59, w * 0.29, h * 0.25, 999, "zen-product") : ""}
    <text x="${pad}" y="${h - pad}" fill="${ink}" font-size="16" font-weight="700" font-family="Inter,Arial,sans-serif">${esc(campaign.cta)} →</text>`;
}

function renderDesign(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat) {
  const body = campaign.template === "impact"
    ? renderImpact(campaign, brand, format)
    : campaign.template === "spotlight"
      ? renderSpotlight(campaign, brand, format)
      : campaign.template === "retail"
        ? renderRetail(campaign, brand, format)
        : campaign.template === "zen"
          ? renderZen(campaign, brand, format)
          : renderEditorial(campaign, brand, format);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${format.width}" height="${format.height}" viewBox="0 0 ${format.width} ${format.height}" role="img" aria-label="${attr(campaign.headline)}">${body}</svg>`;
}

export function svgStringToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderMockup(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: Exclude<MarketingMockup, "none">) {
  const design = svgStringToDataUrl(renderDesign(campaign, brand, format));
  const bg = "#E9EDF3";
  const shadow = `<defs><filter id="mk-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#111827" flood-opacity="0.22"/></filter></defs>`;
  const image = (x: number, y: number, w: number, h: number, radius = 0) => `<defs><clipPath id="mk-clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs><image href="${attr(design)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#mk-clip)"/>`;
  let object = "";
  if (mockup === "tshirt") {
    object = `<g filter="url(#mk-shadow)"><path d="M360 260 L480 190 L560 250 L640 190 L760 260 L870 430 L745 505 L700 430 L700 1000 L420 1000 L420 430 L375 505 L250 430 Z" fill="#F8FAFC" stroke="#D5DBE5" stroke-width="4"/>${image(470, 430, 180, 225, 12)}</g>`;
  } else if (mockup === "mug") {
    object = `<g filter="url(#mk-shadow)"><rect x="310" y="360" width="500" height="430" rx="80" fill="#FAFAFA" stroke="#D7DDE7" stroke-width="4"/><path d="M810 445 C1010 420 1015 710 810 700" fill="none" stroke="#E4E8EF" stroke-width="75"/>${image(375, 430, 370, 290, 24)}</g>`;
  } else if (mockup === "tote") {
    object = `<g filter="url(#mk-shadow)"><path d="M330 355 Q560 300 790 355 L835 990 Q560 1040 285 990 Z" fill="#F1E8D9" stroke="#D7C9B4" stroke-width="4"/><path d="M420 385 C420 160 700 160 700 385" fill="none" stroke="#D7C9B4" stroke-width="34"/>${image(390, 475, 340, 425, 12)}</g>`;
  } else if (mockup === "packaging") {
    object = `<g filter="url(#mk-shadow)"><polygon points="330,350 690,285 850,390 490,460" fill="#EEF2F7"/><polygon points="690,285 850,390 850,910 690,805" fill="#D9E0EA"/><rect x="330" y="350" width="360" height="520" fill="#fff"/>${image(355, 385, 310, 445, 4)}</g>`;
  } else if (mockup === "rollup") {
    object = `<g filter="url(#mk-shadow)"><rect x="390" y="135" width="340" height="920" rx="6" fill="#fff"/>${image(405, 150, 310, 875, 2)}<rect x="350" y="1055" width="420" height="34" rx="12" fill="#3B4352"/><line x1="560" y1="1089" x2="560" y2="1160" stroke="#3B4352" stroke-width="12"/></g>`;
  } else {
    object = `<g filter="url(#mk-shadow)"><rect x="190" y="160" width="740" height="920" rx="18" fill="#D6DCE5"/><rect x="235" y="205" width="650" height="830" rx="8" fill="#F8FAFC"/>${image(275, 255, 570, 730, 4)}<line x1="560" y1="205" x2="560" y2="1035" stroke="#C0C8D4" stroke-width="10"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1280" viewBox="0 0 1200 1280"><rect width="1200" height="1280" fill="${bg}"/>${shadow}<circle cx="1020" cy="210" r="160" fill="${brand.accent}" opacity="0.12"/><text x="70" y="92" fill="#667085" font-size="18" font-weight="800" letter-spacing="2" font-family="Inter,Arial,sans-serif">MOCKUP · ${esc(mockup.toUpperCase())}</text>${object}</svg>`;
}

export function renderMarketingSvg(campaign: MarketingCampaign, brand: BrandProfile, format: MarketingFormat, mockup: MarketingMockup = "none") {
  return mockup === "none" ? renderDesign(campaign, brand, format) : renderMockup(campaign, brand, format, mockup);
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
