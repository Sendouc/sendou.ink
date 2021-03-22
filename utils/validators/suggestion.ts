import * as z from "zod";

export const SUGGESTION_DESCRIPTION_LIMIT = 500;
export const SUGGESTION_DESCRIPTION_MIN = 5;

const suggestionRootSchema = z.object({
  description: z
    .string()
    .max(SUGGESTION_DESCRIPTION_LIMIT)
    .min(SUGGESTION_DESCRIPTION_MIN),
});

export const suggestionFullSchema = suggestionRootSchema.extend({
  suggestedId: z.number().int(),
  tier: z.number().int().min(1).max(3),
  region: z.enum(["NA", "EU"]),
});

export const resuggestionSchema = suggestionRootSchema;
