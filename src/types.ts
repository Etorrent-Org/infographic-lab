export type InfographicKind = "auto" | "process" | "comparison" | "timeline" | "list";
export type InfographicStyle =
  | "clean"
  | "soft"
  | "dark"
  | "sketch"
  | "chalk"
  | "zen"
  | "pro"
  | "minimal"
  | "tech";
export type V1InfographicStyle = "clean" | "soft" | "dark" | "sketch" | "chalk";
export type CustomVisualKind = "iceberg" | "cycle" | "sankey";

export type InfographicIcon =
  | "idea"
  | "search"
  | "target"
  | "process"
  | "team"
  | "data"
  | "security"
  | "automation"
  | "growth"
  | "money"
  | "customer"
  | "check"
  | "warning"
  | "calendar"
  | "tools"
  | "spark";

export type VisualDensity = "compact" | "balanced" | "airy";

export type InfographicAppearance = {
  accent?: string;
  background?: string;
  density?: VisualDensity;
};

export type InfographicItem = {
  title: string;
  description: string;
  icon?: InfographicIcon;
};

export type CanonicalInfographic = {
  title: string;
  subtitle?: string;
  layout: Exclude<InfographicKind, "auto">;
  items: InfographicItem[];
  appearance?: InfographicAppearance;
};

export type InfographicProject = {
  format: "infographic-lab";
  version: 1 | 2;
  savedAt: string;
  sourceText: string;
  type: InfographicKind;
  style: InfographicStyle;
  variantIndex: number;
  infographic: CanonicalInfographic;
};

export type GenerateRequest = {
  text: string;
  type: InfographicKind;
  style: InfographicStyle;
  language: "fr";
};

export type GenerateResponse = {
  infographic: CanonicalInfographic;
  durationMs?: number;
  provider?: string;
};

export type RegenerateItemRequest = {
  sourceText: string;
  infographic: CanonicalInfographic;
  itemIndex: number;
  instruction?: string;
};

export type RegenerateItemResponse = {
  item: InfographicItem;
  durationMs?: number;
  provider?: string;
};
