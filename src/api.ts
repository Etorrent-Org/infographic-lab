import type {
  GenerateRequest,
  GenerateResponse,
  RegenerateItemRequest,
  RegenerateItemResponse,
} from "./types";
import { validateCanonicalInfographic, validateInfographicItem } from "./validation";

export async function generateInfographic(input: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as {
    data?: unknown;
    error?: string;
    provider?: string;
    durationMs?: number;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "La génération a échoué.");
  }

  return {
    infographic: validateCanonicalInfographic(body.data),
    durationMs: body.durationMs,
    provider: body.provider,
  };
}

export async function regenerateInfographicItem(
  input: RegenerateItemRequest,
): Promise<RegenerateItemResponse> {
  const infographicForVibe = {
    title: input.infographic.title,
    ...(input.infographic.subtitle !== undefined ? { subtitle: input.infographic.subtitle } : {}),
    layout: input.infographic.layout,
    items: input.infographic.items.map((item) => ({
      title: item.title,
      description: item.description,
    })),
  };

  const response = await fetch("/api/regenerate-item", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...input,
      infographic: infographicForVibe,
    }),
  });

  const body = (await response.json()) as {
    data?: unknown;
    error?: string;
    provider?: string;
    durationMs?: number;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "La réécriture du bloc a échoué.");
  }

  return {
    item: validateInfographicItem(body.data),
    durationMs: body.durationMs,
    provider: body.provider,
  };
}
