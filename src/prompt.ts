import type { GenerateRequest } from "./types";
import { infographicOutputSchema } from "./schema";

export const PROMPT_PROTOCOL = "h9-json-envelope-v1";

export function buildPromptEnvelope(input: GenerateRequest) {
  return JSON.stringify(
    {
      protocol: PROMPT_PROTOCOL,
      trustedInstructions: {
        runtime: [
          "Transforme uniquement les données utilisateur en une structure d'infographie concise.",
          "N'invente ni CSS, ni HTML, ni JavaScript, ni SVG.",
          "Respecte strictement les longueurs et le nombre d'éléments du schéma.",
          "Si type vaut auto, choisis le layout le plus adapté parmi process, comparison, timeline et list.",
          "Le style visuel est géré par l'application et ne doit pas influencer la structure de sortie.",
        ],
        application: "Infographic Lab",
      },
      untrustedData: {
        text: input.text,
        requestedType: input.type,
        language: input.language,
      },
      outputContract: infographicOutputSchema,
    },
    null,
    2,
  );
}
