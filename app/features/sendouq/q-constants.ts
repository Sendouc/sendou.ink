import type { Group } from "~/db/types";
import { assertType } from "~/utils/types";

export const MAP_LIST_PREFERENCE_OPTIONS = [
  "NO_PREFERENCE",
  "PREFER_ALL_MODES",
  "PREFER_SZ",
  "ALL_MODES_ONLY",
  "SZ_ONLY",
] as const;
assertType<
  Group["mapListPreference"],
  (typeof MAP_LIST_PREFERENCE_OPTIONS)[number]
>();
assertType<
  (typeof MAP_LIST_PREFERENCE_OPTIONS)[number],
  Group["mapListPreference"]
>();

export const SENDOUQ = {
  SZ_MAP_COUNT: 6,
  OTHER_MODE_MAP_COUNT: 3,
  MAX_STAGE_REPEAT_COUNT: 2,
} as const;

export const FULL_GROUP_SIZE = 4;

export const SENDOUQ_BEST_OF = 7;

export const JOIN_CODE_SEARCH_PARAM_KEY = "join";

export const USER_SKILLS_CACHE_KEY = "user-skills";
