import * as z from "zod";

export const SUGGESTION_DESCRIPTION_LIMIT = 500;

const suggestionRootSchema = z.object({
  description: z.string().max(SUGGESTION_DESCRIPTION_LIMIT),
});

export const suggestionFullSchema = suggestionRootSchema.extend({
  suggestedId: z.number().int(),
  tier: z.number().int().min(1).max(3),
  region: z.enum(["NA", "EU"]),
});

export const resuggestionSchema = suggestionRootSchema;
