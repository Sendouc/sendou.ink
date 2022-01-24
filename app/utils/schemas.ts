import type { Mode } from ".prisma/client";
import { z } from "zod";
import type { Unpacked } from "~/utils";
import { assertType } from "./assertType";

type MapList = z.infer<typeof ModeSchema>;
assertType<Unpacked<MapList>, Mode>();

export const ModeSchema = z.enum(["TW", "SZ", "TC", "RM", "CB"]);

export type SeedVariations = z.infer<typeof SeedVariationsSchema>;
export const SeedVariationsSchema = z.enum([
  "check-in",
  "match",
  "tournament-start",
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
