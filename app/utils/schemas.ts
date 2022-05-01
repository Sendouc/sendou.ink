import type { Mode } from ".prisma/client";
import { z } from "zod";
import { BEST_OF_OPTIONS, TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { LoggedInUserNew } from "~/db/types";
import { safeJSONParse, Unpacked } from "~/utils";
import { assertType } from "./assertType";

type MapList = z.infer<typeof ModeSchema>;
assertType<Unpacked<MapList>, Mode>();

export const ModeSchema = z.enum(["TW", "SZ", "TC", "RM", "CB"]);

export type SeedVariations = z.infer<typeof SeedVariationsSchema>;
export const SeedVariationsSchema = z.enum([
  "check-in",
  "match",
  "tournament-start",
  "looking",
  "looking-match",
]);

export type LoggedInUser = NonNullable<
  z.infer<typeof LoggedInUserSchema>
>["user"];
export const LoggedInUserSchema = z
  .object({
    user: z
      .object({
        id: z.string(),
        discordId: z.string(),
        discordAvatar: z.string().nullable(),
      })
      .nullish(),
  })
  .nullish();

const loggedInUserSchema = z.object({
  id: z.number(),
  discordId: z.string(),
  discordAvatar: z.string().nullable(),
});
assertType<z.infer<typeof loggedInUserSchema>, LoggedInUserNew>();
export const LoggedInUserFromContextSchema = z
  .object({
    user: loggedInUserSchema.optional(),
  })
  .optional();

export const reportedMatchPlayerIds = z.preprocess(
  safeJSONParse,
  z.array(z.string().uuid()).length(TOURNAMENT_TEAM_ROSTER_MIN_SIZE * 2)
);

export const reportedMatchPositions = z.preprocess(
  Number,
  z
    .number()
    .min(1)
    .max(Math.max(...BEST_OF_OPTIONS))
);
