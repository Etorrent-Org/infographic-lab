import type {
  GenerateRequest,
  GenerateResponse,
  ProviderStatus,
  QualityReview,
  QualityReviewRequest,
  RegenerateItemRequest,
  RegenerateItemResponse,
} from "./types";
import { loadGenerationPreferences } from "./generation-preferences";
import { validateCanonicalInfographic, validateInfographicItem } from "./validation";

function toAiInfographic(input: RegenerateItemRequest["infographic"]) {
  return {
    title: input.title,
    ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
    layout: input.layout,
    items: input.items.map((item) => ({
      title: item.title,
      description: item.description,
      blockType: item.blockType,
      claimType: item.claimType,
      ...(item.evidence ? { evidence: item.evidence } : {}),
      ...(typeof item.value === "number" ? { value: item.value } : {}),
      ...(item.unit ? { unit: item.unit } : {}),
      ...(item.category ? { category: item.category } : {}),
      ...(item.series ? { series: item.series } : {}),
    })),
  };
}

async function readBody(response: Response) {
  try {
    return await response.json() as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function getProviders(): Promise<ProviderStatus[]> {
  const response = await fetch("/api/providers", { headers: { accept: "application/json" } });
  const body = await readBody(response);
  if (!response.ok || !Array.isArray(body.providers)) {
    throw new Error(typeof body.error === "string" ? body.error : "État des moteurs IA indisponible.");
  }
  return body.providers as ProviderStatus[];
}

export async function generateInfographic(input: GenerateRequest): Promise<GenerateResponse> {
  const preferences = input.preferences ?? loadGenerationPreferences();
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, preferences }),
  });
  const body = await readBody(response);
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "La génération a échoué.");
  }
  const infographic = validateCanonicalInfographic(body.data);
  infographic.appearance = {
    ...infographic.appearance,
    orientation: preferences.orientation,
    visual: preferences.visual,
  };
  return {
    infographic,
    durationMs: typeof body.durationMs === "number" ? body.durationMs : undefined,
    provider: typeof body.provider === "string" ? body.provider : undefined,
    warnings: Array.isArray(body.warnings) ? body.warnings.filter((value): value is string => typeof value === "string") : undefined,
  };
}

export async function regenerateInfographicItem(input: RegenerateItemRequest): Promise<RegenerateItemResponse> {
  const response = await fetch("/api/regenerate-item", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, infographic: toAiInfographic(input.infographic) }),
  });
  const body = await readBody(response);
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "La réécriture du bloc a échoué.");
  }
  return {
    item: validateInfographicItem(body.data),
    durationMs: typeof body.durationMs === "number" ? body.durationMs : undefined,
    provider: typeof body.provider === "string" ? body.provider : undefined,
  };
}

export async function reviewInfographic(input: QualityReviewRequest): Promise<QualityReview> {
  const response = await fetch("/api/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, infographic: toAiInfographic(input.infographic) }),
  });
  const body = await readBody(response);
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "Le contrôle qualité a échoué.");
  }
  const data = body.data as Record<string, unknown> | undefined;
  if (!data || typeof data.score !== "number" || typeof data.summary !== "string" || !Array.isArray(data.issues)) {
    throw new Error("Réponse de contrôle qualité invalide.");
  }
  return {
    score: Math.max(0, Math.min(100, Math.round(data.score))),
    summary: data.summary,
    issues: data.issues as QualityReview["issues"],
    provider: typeof body.provider === "string" ? body.provider : undefined,
    durationMs: typeof body.durationMs === "number" ? body.durationMs : undefined,
  };
}
