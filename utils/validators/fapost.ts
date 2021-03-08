import * as z from "zod";

export const FA_POST_CONTENT_LIMIT = 2000;

export const freeAgentPostSchema = z.object({
  playstyles: z.array(z.enum(["FRONTLINE", "MIDLINE", "BACKLINE"])).min(1),
  canVC: z.enum(["YES", "NO", "MAYBE"]),
  content: z.string().max(FA_POST_CONTENT_LIMIT),
});
