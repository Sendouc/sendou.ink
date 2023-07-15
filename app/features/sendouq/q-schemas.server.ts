import { z } from "zod";
import { MAP_LIST_PREFERENCE_OPTIONS, SENDOUQ_BEST_OF } from "./q-constants";
import { id, safeJSONParse } from "~/utils/zod";
import { matchEndedAtIndex } from "./core/match";

export const createGroupSchema = z.object({
  rankingType: z.enum(["ranked", "scrim"]),
  mapListPreference: z.enum(MAP_LIST_PREFERENCE_OPTIONS),
  mapPool: z.string(),
  direct: z.literal("true").nullish(),
});

export const lookingSchema = z.union([
  z.object({
    _action: z.literal("LIKE"),
    targetGroupId: id,
  }),
  z.object({
    _action: z.literal("UNLIKE"),
    targetGroupId: id,
  }),
  z.object({
    _action: z.literal("GROUP_UP"),
    targetGroupId: id,
  }),
  z.object({
    _action: z.literal("MATCH_UP"),
    targetGroupId: id,
  }),
  z.object({
    _action: z.literal("GIVE_MANAGER"),
    userId: id,
  }),
  z.object({
    _action: z.literal("REMOVE_MANAGER"),
    userId: id,
  }),
  z.object({
    _action: z.literal("LEAVE_GROUP"),
  }),
  z.object({
    _action: z.literal("REFRESH_GROUP"),
  }),
]);

export const matchSchema = z.union([
  z.object({
    _action: z.literal("REPORT_SCORE"),
    winners: z.preprocess(
      safeJSONParse,
      z
        .array(z.enum(["ALPHA", "BRAVO"]))
        .min(Math.ceil(SENDOUQ_BEST_OF / 2))
        .max(SENDOUQ_BEST_OF)
        .refine((val) => {
          const matchEndedAt = matchEndedAtIndex(val);

          // match did end
          if (matchEndedAt === null) return true;

          // no extra scores after match ended
          return val.length === matchEndedAt + 1;
        })
    ),
  }),
  z.object({
    _action: z.literal("PLACEHOLDER"),
  }),
]);
