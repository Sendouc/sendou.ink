import * as z from "zod";

export const votesSchema = z.array(
  z.object({
    score: z.number().min(-2).max(2).int(),
    userId: z.number(),
  })
);
