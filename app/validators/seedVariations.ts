import { z } from "zod";

export type SeedVariations = z.infer<typeof SeedVariationsSchema>;
export const SeedVariationsSchema = z.enum(["check-in", "match"]);
