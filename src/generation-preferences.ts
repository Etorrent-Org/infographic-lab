import type { GenerationPreferences } from "./types";

const STORAGE_KEY = "infographic-lab-generation-preferences-v1";

export const defaultGenerationPreferences: GenerationPreferences = {
  orientation: "auto",
  detail: "balanced",
  wording: "rephrase",
  visual: "auto",
};

export function loadGenerationPreferences(): GenerationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultGenerationPreferences };
    const parsed = JSON.parse(raw) as Partial<GenerationPreferences>;
    return {
      orientation: ["auto", "portrait", "landscape", "square"].includes(parsed.orientation ?? "")
        ? parsed.orientation as GenerationPreferences["orientation"]
        : "auto",
      detail: ["summary", "balanced", "detailed"].includes(parsed.detail ?? "")
        ? parsed.detail as GenerationPreferences["detail"]
        : "balanced",
      wording: ["rephrase", "close"].includes(parsed.wording ?? "")
        ? parsed.wording as GenerationPreferences["wording"]
        : "rephrase",
      visual: [
        "auto", "iceberg", "cycle", "sankey", "matrix", "architecture", "hub", "table",
        "kpi", "tree", "venn", "swot", "impact", "eisenhower", "risk", "bar", "column",
        "line", "donut", "waterfall",
      ].includes(parsed.visual ?? "")
        ? parsed.visual as GenerationPreferences["visual"]
        : "auto",
    };
  } catch {
    return { ...defaultGenerationPreferences };
  }
}

export function saveGenerationPreferences(value: GenerationPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("infographic-lab-generation-preferences", { detail: value }));
}
