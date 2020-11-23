import { abilities } from "lib/lists/abilities";
import { clothingGear, headGear, shoesGear } from "lib/lists/gear";
import { weaponsWithHero } from "lib/lists/weaponsWithHero";
import * as z from "zod";
import { hasNoDuplicates } from "./common";

export const TITLE_CHARACTER_LIMIT = 100;
export const DESCRIPTION_CHARACTER_LIMIT = 1000;

const abilityEnum = z.enum([
  "ISM",
  "ISS",
  "REC",
  "RSU",
  "SSU",
  "SCU",
  "SS",
  "SPU",
  "QR",
  "QSJ",
  "BRU",
  "RES",
  "BDU",
  "MPU",
  "OG",
  "LDE",
  "T",
  "CB",
  "NS",
  "H",
  "TI",
  "RP",
  "AD",
  "SJ",
  "OS",
  "DR",
]);

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
});

function isAbilityArray(arr: any[], type: "HEAD" | "CLOTHING" | "SHOES") {
  if (arr.length !== 4) return false;

  return arr.every((value, index) => {
    const ability = abilities.find(
      (abilityCodeInArray) => value === abilityCodeInArray.code
    );
    if (!ability) return false;

    if (index === 0) return ["STACKABLE", type].includes(ability.type);

    return ability.type === "STACKABLE";
  });
}
