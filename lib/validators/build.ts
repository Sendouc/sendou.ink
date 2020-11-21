import { abilities } from "lib/lists/abilities";
import { clothingGear, headGear, shoesGear } from "lib/lists/gear";
import { weaponsWithHero } from "lib/lists/weaponsWithHero";
import * as z from "zod";
import { hasNoDuplicates } from "./common";

export const buildSchema = z.object({
  weapon: z.string().refine((val) => weaponsWithHero.includes(val as any)),
  title: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  modes: z
    .array(z.string())
    .min(1)
    .max(5)
    .refine((arr) =>
      arr.every((val) => ["TW", "SZ", "TC", "RM", "CB"].includes(val as any))
    )
    .refine(hasNoDuplicates),
  headAbilities: z
    .array(z.string())
    .refine((arr) => isAbilityArray(arr, "HEAD")),
  clothingAbilities: z
    .array(z.string())
    .refine((arr) => isAbilityArray(arr, "CLOTHING")),
  shoesAbilities: z
    .array(z.string())
    .refine((arr) => isAbilityArray(arr, "SHOES")),
  headGear: z
    .string()
    .refine((val) => headGear.includes(val as any))
    .optional()
    .nullable(),
  clothingGear: z
    .string()
    .refine((val) => clothingGear.includes(val as any))
    .optional()
    .nullable(),
  shoesGear: z
    .string()
    .refine((val) => shoesGear.includes(val as any))
    .optional()
    .nullable(),
});

function isAbilityArray(arr: any[], type: "HEAD" | "CLOTHING" | "SHOES") {
  if (arr.length !== 4) return false;

  return arr.every((value, index) => {
    const ability = abilities.find(
      (abilityCodeInArray) => value === abilityCodeInArray
    );
    if (!ability) return false;

    if (index === 0) return ["STACKABLE", type].includes(ability.type);

    return ability.type === "STACKABLE";
  });
}
