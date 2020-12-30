import * as z from "zod";

export const freeAgentPostSchema = z.object({
  playstyles: z.array(z.enum(["FRONTLINE", "MIDLINE", "BACKLINE"])),
  canVC: z.enum(["YES", "NO", "MAYBE"]),
  content: z.string().max(2000),
});
