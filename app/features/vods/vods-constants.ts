import type { Video } from "~/db/types";
import { assertType } from "~/utils/types";

export const videoMatchTypes = [
  "TOURNAMENT",
  "CAST",
  "SCRIM",
  "MATCHMAKING",
] as const;
assertType<(typeof videoMatchTypes)[number], Array<Video["type"]>[number]>();
