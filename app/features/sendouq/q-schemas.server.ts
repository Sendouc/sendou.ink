import { z } from "zod";
import { MAP_LIST_PREFERENCE_OPTIONS } from "./q-constants";

export const createGroupSchema = z.object({
  rankingType: z.enum(["ranked", "scrim"]),
  mapListPreference: z.enum(MAP_LIST_PREFERENCE_OPTIONS),
  mapPool: z.string(),
  direct: z.literal("true").nullish(),
});
