import type { VideoMatch } from "~/db/types";
import { assertType } from "~/utils/types";

export const videoMatchTypes = [
  "TOURNAMENT",
  "CAST",
  "SCRIM",
  "MATCHMAKING",
] as const;
assertType<
  (typeof videoMatchTypes)[number],
  Array<VideoMatch["type"]>[number]
>();
