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
  structureScore: number;
};

const templates: MarketingTemplate[] = ["editorial", "impact", "spotlight", "retail"];

function layoutName(svg: string) {
  return svg.match(/data-layout=\"([^\"]+)\"/)?.[1] ?? "unknown";
}

function structureScore(svg: string) {
  const raw = svg.match(/data-structure-score=\"([^\"]+)\"/)?.[1];
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Harnais local de validation structurelle du studio Visuels.
 * 4 campagnes x 4 directions x 8 formats = 128 rendus.
 * Le score 8/10 est un gate heuristique de composition, pas une note artistique humaine.
 */
export function buildMarketingBaselineReport(): MarketingBaselineRow[] {
  const brand = defaultBrands[0];
  if (!brand) return [];

  return baselineCases.flatMap((entry) => templates.flatMap((template) => marketingFormats.map((format) => {
    const campaign = { ...entry.campaign, template };
    const svg = renderMarketingSvgV2(campaign, brand, format);
    const validation = validateSvg(svg, format);
    return {
      id: entry.id,
      template,
      format: format.id,
      valid: validation.valid,
      errors: validation.errors,
      layout: layoutName(svg),
      structureScore: structureScore(svg),
    };
  })));
}

export function assertMarketingBaseline() {
  const rows = buildMarketingBaselineReport();
  const failures = rows.filter((row) => !row.valid || row.layout === "safe-composition" || row.structureScore < 8);
  if (rows.length !== 128) {
    throw new Error(`Baseline marketing incomplète : ${rows.length} rendus au lieu de 128.`);
  }
  if (failures.length) {
    throw new Error(`Baseline marketing sous le seuil : ${failures.map((row) => `${row.template}/${row.format}/${row.layout}: ${row.errors.join(", ") || `score ${row.structureScore}`}`).join(" | ")}`);
  }
  return rows;
}
