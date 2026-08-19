export const infographicOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "layout", "items"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 120 },
    subtitle: { type: "string", maxLength: 180 },
    layout: {
      type: "string",
      enum: ["process", "comparison", "timeline", "list"],
    },
    items: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 60 },
          description: { type: "string", minLength: 1, maxLength: 180 },
        },
      },
    },
  },
} as const;
