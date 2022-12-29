import { z } from "zod";

export const teamParamsSchema = z.object({ customUrl: z.string() });
