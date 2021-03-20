import * as z from "zod";

export const voteSchema = z.object({
  score: z.number().min(-2).max(2).int(),
  userId: z.number(),
});

export const votesSchema = z.array(voteSchema);
