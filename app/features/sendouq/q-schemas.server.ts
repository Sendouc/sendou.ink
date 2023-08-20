import { z } from "zod";
import {
  FULL_GROUP_SIZE,
  MAP_LIST_PREFERENCE_OPTIONS,
  SENDOUQ_BEST_OF,
} from "./q-constants";
import {
  _action,
  checkboxValueToBoolean,
  deduplicate,
  id,
  safeJSONParse,
  weaponSplId,
  stageId,
  modeShort,
} from "~/utils/zod";
import { matchEndedAtIndex } from "./core/match";

export const frontPageSchema = z.union([
  z.object({
    _action: _action("JOIN_QUEUE"),
    mapListPreference: z.enum(MAP_LIST_PREFERENCE_OPTIONS),
    mapPool: z.string(),
    direct: z.preprocess(deduplicate, z.literal("true").nullish()),
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
    _action: _action("REFRESH_GROUP"),
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
    })
);
export const matchSchema = z.union([
  z.object({
    _action: _action("REPORT_SCORE"),
    winners,
    adminReport: z.preprocess(
      checkboxValueToBoolean,
      z.boolean().nullish().default(false)
    ),
  }),
  z.object({
    _action: _action("LOOK_AGAIN"),
    previousGroupId: id,
  }),
  z.object({
    _action: _action("REPORT_WEAPONS"),
    weapons: z.preprocess(
      safeJSONParse,
      z.array(z.array(weaponSplId).length(FULL_GROUP_SIZE * 2))
    ),
  }),
]);

export const weaponUsageSearchParamsSchema = z.object({
  userId: id,
  season: z.coerce.number().int(),
  stageId,
  modeShort,
});
