import { isAbilityArray } from "utils/lists/abilities";
import { clothingGear, headGear, shoesGear } from "utils/lists/gear";
import { weaponsWithHero } from "utils/lists/weaponsWithHero";
import * as z from "zod";
import { abilityEnum, hasNoDuplicates } from "./common";

export const TITLE_CHARACTER_LIMIT = 100;
export const DESCRIPTION_CHARACTER_LIMIT = 1000;

export const buildSchema = z.object({
  weapon: z.string().refine((val) => weaponsWithHero.includes(val as any)),
  title: z.string().max(TITLE_CHARACTER_LIMIT).optional().nullable(),
  description: z
    .string()
    .max(DESCRIPTION_CHARACTER_LIMIT)
    .optional()
    .nullable(),
  modes: z
    .array(z.enum(["TW", "SZ", "TC", "RM", "CB"]))
    .min(1)
    .max(5)
    .refine(hasNoDuplicates),
  headAbilities: z
    .array(abilityEnum)
    .refine((arr) => isAbilityArray(arr, "HEAD")),
  clothingAbilities: z
    .array(abilityEnum)
    .refine((arr) => isAbilityArray(arr, "CLOTHING")),
  shoesAbilities: z
    .array(abilityEnum)
    .refine((arr) => isAbilityArray(arr, "SHOES")),
  headGear: z
    .string()
    .refine((val) => !val || headGear.includes(val as any))
    .optional()
    .nullable(),
  clothingGear: z
    .string()
    .refine((val) => !val || clothingGear.includes(val as any))
    .optional()
    .nullable(),
  shoesGear: z
    .string()
    .refine((val) => !val || shoesGear.includes(val as any))
    .optional()
    .nullable(),
  id: z.number().optional(),
});
