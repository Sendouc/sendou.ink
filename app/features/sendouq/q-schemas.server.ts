import { z } from "zod";
import { MAP_LIST_PREFERENCE_OPTIONS } from "./q-constants";
import { id } from "~/utils/zod";

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
]);
