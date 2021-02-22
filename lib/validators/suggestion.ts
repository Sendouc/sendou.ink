import * as z from "zod";

export const SUGGESTION_DESCRIPTION_LIMIT = 500;

export const suggestionSchema = z.object({
  description: z.string().max(SUGGESTION_DESCRIPTION_LIMIT),
  suggestedUserId: z.number().int(),
  tier: z.number().int().min(1).max(3),
});
