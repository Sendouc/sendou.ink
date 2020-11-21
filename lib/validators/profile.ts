import { countries } from "countries-list";
import { weaponsWithHero } from "lib/lists/weaponsWithHero";
import * as z from "zod";
import { hasNoDuplicates } from "./common";

export const PROFILE_CHARACTER_LIMIT = 7000;

const profileRootSchema = z.object({
  bio: z.string().max(PROFILE_CHARACTER_LIMIT).optional().nullable(),
  country: z
    .string()
    .refine((val) => !val || Object.keys(countries).includes(val))
    .optional()
    .nullable(),
  customUrlPath: z
    .string()
    .max(32)
    .refine(
      (val) => !val || isCustomUrl(val),
      "Name in the custom URL can't only contain numbers"
    )
    .optional()
    .nullable(),
  twitchName: z.string().max(25).optional().nullable(),
  twitterName: z.string().max(15).optional().nullable(),
  youtubeId: z.string().optional().nullable(),
  weaponPool: z
    .array(z.string())
    .max(5)
    .refine((arr) => arr.every((val) => weaponsWithHero.includes(val as any)))
    .refine(hasNoDuplicates),
});

export const profileSchemaFrontend = profileRootSchema.extend({
  sensMotion: z.string(),
  sensStick: z.string(),
});

export const profileSchemaBackend = profileRootSchema.extend({
  sensMotion: z
    .number()
    .min(-5)
    .max(5)
    .refine((val) => (val * 10) % 5 === 0)
    .optional()
    .nullable(),
  sensStick: z
    .number()
    .min(-50)
    .max(50)
    .refine((val) => (val * 10) % 5 === 0)
    .optional()
    .nullable(),
});

export function isCustomUrl(identifier: string) {
  return isNaN(Number(identifier));
}
