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
export type CustomVisualKind =
  | "iceberg"
  | "cycle"
  | "sankey"
  | "matrix"
  | "architecture"
  | "hub"
  | "table"
  | "kpi"
  | "venn"
  | "tree"
  | "swot"
  | "impact"
  | "eisenhower"
  | "risk"
  | "chart-bar"
  | "chart-column"
  | "chart-line"
  | "chart-donut"
  | "chart-waterfall";

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
export type VisualOrientation = "auto" | "portrait" | "landscape" | "square";
export type GenerationDetail = "summary" | "balanced" | "detailed";
export type WordingMode = "rephrase" | "close";
export type VisualTarget =
  | "auto"
  | "iceberg"
  | "cycle"
  | "sankey"
  | "matrix"
  | "architecture"
  | "hub"
  | "table"
  | "kpi"
  | "tree"
  | "venn"
  | "swot"
  | "impact"
  | "eisenhower"
  | "risk"
  | "bar"
  | "column"
  | "line"
  | "donut"
  | "waterfall";

export type GenerationPreferences = {
  orientation: VisualOrientation;
  detail: GenerationDetail;
  wording: WordingMode;
  visual: VisualTarget;
};

export type UsageIntent = "explain" | "decide" | "convince" | "train" | "summarize";
export type AIProvider = "auto" | "vibe" | "codex";
export type RepresentationKind = "infographic" | "mermaid" | "mindmap" | "markdown";
export type BlockKind =
  | "process"
  | "timeline"
  | "comparison"
  | "list"
  | "cycle"
  | "matrix"
  | "architecture"
  | "summary";
export type ClaimKind = "fact" | "interpretation" | "suggestion";

export type InfographicAppearance = {
  accent?: string;
  background?: string;
  density?: VisualDensity;
  orientation?: VisualOrientation;
  visual?: VisualTarget;
};

export type InfographicItem = {
  title: string;
  description: string;
  icon?: InfographicIcon;
  blockType?: BlockKind;
  claimType?: ClaimKind;
  evidence?: string;
  value?: number;
  unit?: string;
  category?: string;
  series?: string;
};

export type CanonicalInfographic = {
  title: string;
  subtitle?: string;
  layout: Exclude<InfographicKind, "auto">;
  items: InfographicItem[];
  appearance?: InfographicAppearance;
};

export type BrandProfile = {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  fontFamily: "system" | "serif" | "mono";
  footer?: string;
  logoDataUrl?: string;
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
  intent?: UsageIntent;
  provider?: AIProvider;
  preferences?: GenerationPreferences;
};

export type GenerateResponse = {
  infographic: CanonicalInfographic;
  durationMs?: number;
  provider?: string;
  warnings?: string[];
};

export type RegenerateItemRequest = {
  sourceText: string;
  infographic: CanonicalInfographic;
  itemIndex: number;
  instruction?: string;
  intent?: UsageIntent;
  provider?: AIProvider;
};

export type RegenerateItemResponse = {
  item: InfographicItem;
  durationMs?: number;
  provider?: string;
};

export type ProviderStatus = {
  id: Exclude<AIProvider, "auto">;
  label: string;
  configured: boolean;
  available: boolean;
  detail?: string;
};

export type QualityIssue = {
  severity: "warning" | "info";
  category: "readability" | "structure" | "content" | "sources";
  message: string;
  itemIndex?: number;
  suggestion?: string;
  proposedTitle?: string;
  proposedDescription?: string;
};

export type QualityReview = {
  score: number;
  summary: string;
  issues: QualityIssue[];
  provider?: string;
  durationMs?: number;
};

export type QualityReviewRequest = {
  sourceText: string;
  infographic: CanonicalInfographic;
  intent: UsageIntent;
  provider: AIProvider;
};
