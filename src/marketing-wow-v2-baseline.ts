import { defaultBrands } from "./augmented";
import { marketingFormats, type MarketingTemplate } from "./marketing";
import { renderMarketingSvgV2 } from "./marketing-wow-v2-renderer";
import { baselineCases, validateSvg } from "./marketing-wow-v2-validation";

export type MarketingBaselineRow = {
  id: string;
  template: MarketingTemplate;
  format: string;
  valid: boolean;
  errors: string[];
  layout: string;
};

const templates: MarketingTemplate[] = ["editorial", "impact", "spotlight", "retail", "zen"];

function layoutName(svg: string) {
  return svg.match(/data-layout=\"([^\"]+)\"/)?.[1] ?? "unknown";
}

/**
 * Harnais local de validation visuelle/structurelle.
 * Il ne modifie pas l'UI et peut être appelé depuis un test ou un outil de développement.
 * 4 campagnes x 5 directions x 8 formats = 160 rendus contrôlés.
 */
export function buildMarketingBaselineReport(): MarketingBaselineRow[] {
  const brand = defaultBrands[0];
  if (!brand) return [];

  return baselineCases.flatMap((entry) => templates.flatMap((template) => marketingFormats.map((format) => {
    const campaign = { ...entry.campaign, template };
    const svg = renderMarketingSvgV2(campaign, brand, format, "none");
    const validation = validateSvg(svg, format);
    return {
      id: entry.id,
      template,
      format: format.id,
      valid: validation.valid,
      errors: validation.errors,
      layout: layoutName(svg),
    };
  })));
}

export function assertMarketingBaseline() {
  const rows = buildMarketingBaselineReport();
  const failures = rows.filter((row) => !row.valid);
  if (rows.length < 40) {
    throw new Error(`Baseline marketing incomplète : ${rows.length} rendus.`);
  }
  if (failures.length) {
    throw new Error(`Baseline marketing invalide : ${failures.map((row) => `${row.template}/${row.format}: ${row.errors.join(", ")}`).join(" | ")}`);
  }
  return rows;
}
