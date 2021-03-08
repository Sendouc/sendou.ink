import * as z from "zod";

export const vouchSchema = z.object({
  vouchedId: z.number().int(),
  tier: z.number().int().min(1).max(3),
  region: z.enum(["NA", "EU"]),
});
