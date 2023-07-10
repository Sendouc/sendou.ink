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
