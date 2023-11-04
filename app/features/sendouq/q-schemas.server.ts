import { z } from "zod";
import { languagesUnified } from "~/modules/i18n/config";
import {
  _action,
  checkboxValueToBoolean,
  deduplicate,
  falsyToNull,
  id,
  modeShort,
  noDuplicates,
  safeJSONParse,
  stageId,
  weaponSplId,
} from "~/utils/zod";
import { matchEndedAtIndex } from "./core/match";
import {
  MAP_LIST_PREFERENCE_OPTIONS,
  SENDOUQ,
  SENDOUQ_BEST_OF,
} from "./q-constants";

export const frontPageSchema = z.union([
  z.object({
    _action: _action("JOIN_QUEUE"),
    mapListPreference: z.enum(MAP_LIST_PREFERENCE_OPTIONS),
    mapPool: z.string(),
    direct: z.preprocess(deduplicate, z.literal("true").nullish()),
    vc: z.enum(["YES", "NO", "LISTEN_ONLY"]),
    languages: z.preprocess(
      safeJSONParse,
      z
        .array(z.string())
        .refine(noDuplicates)
        .refine((val) =>
          val.every((lang) => languagesUnified.some((l) => l.code === lang)),
        ),
    ),
  }),
  z.object({
    _action: _action("JOIN_TEAM"),
  }),
  z.object({
    _action: _action("JOIN_TEAM_WITH_TRUST"),
  }),
  z.object({
    _action: _action("SET_INITIAL_SP"),
    tier: z.enum(["higher", "default", "lower"]),
  }),
]);

export const preparingSchema = z.union([
  z.object({
    _action: _action("JOIN_QUEUE"),
  }),
  z.object({
    _action: _action("ADD_TRUSTED"),
    id,
  }),
]);

export const lookingSchema = z.union([
  z.object({
    _action: _action("LIKE"),
    targetGroupId: id,
  }),
  z.object({
    _action: _action("UNLIKE"),
    targetGroupId: id,
  }),
  z.object({
    _action: _action("GROUP_UP"),
    targetGroupId: id,
  }),
  z.object({
    _action: _action("MATCH_UP"),
    targetGroupId: id,
  }),
  z.object({
    _action: _action("GIVE_MANAGER"),
    userId: id,
  }),
  z.object({
    _action: _action("REMOVE_MANAGER"),
    userId: id,
  }),
  z.object({
    _action: _action("LEAVE_GROUP"),
  }),
  z.object({
    _action: _action("KICK_FROM_GROUP"),
    userId: id,
  }),
  z.object({
    _action: _action("REFRESH_GROUP"),
  }),
  z.object({
    _action: _action("UPDATE_NOTE"),
    value: z.preprocess(
      falsyToNull,
      z.string().max(SENDOUQ.NOTE_MAX_LENGTH).nullable(),
    ),
  }),
]);

const winners = z.preprocess(
  safeJSONParse,
  z
    .array(z.enum(["ALPHA", "BRAVO"]))
    .max(SENDOUQ_BEST_OF)
    .refine((val) => {
      if (val.length === 0) return true;

      const matchEndedAt = matchEndedAtIndex(val);

      // match did end
      if (matchEndedAt === null) return true;

      // no extra scores after match ended
      return val.length === matchEndedAt + 1;
    }),
);

const weapons = z.preprocess(
  safeJSONParse,
  z
    .array(
      z.object({
        weaponSplId,
        userId: id,
        mapIndex: z.number().int().nonnegative(),
        groupMatchMapId: id,
      }),
    )
    .nullish()
    .default([]),
);
export const matchSchema = z.union([
  z.object({
    _action: _action("REPORT_SCORE"),
    winners,
    weapons,
    adminReport: z.preprocess(
      checkboxValueToBoolean,
      z.boolean().nullish().default(false),
    ),
  }),
  z.object({
    _action: _action("LOOK_AGAIN"),
    previousGroupId: id,
  }),
  z.object({
    _action: _action("REPORT_WEAPONS"),
    weapons,
  }),
]);

export const weaponUsageSearchParamsSchema = z.object({
  userId: id,
  season: z.coerce.number().int(),
  stageId,
  modeShort,
});
