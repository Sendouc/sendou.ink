import { z } from "zod";
import { id, safeJSONParse } from "~/utils/zod";
import { TOURNAMENT } from "../tournament/tournament-constants";

const reportedMatchPlayerIds = z.preprocess(
  safeJSONParse,
  z.array(id).length(TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL * 2)
);

const reportedMatchPosition = z.preprocess(
  Number,
  z
    .number()
    .int()
    .min(0)
    .max(Math.max(...TOURNAMENT.AVAILABLE_BEST_OF) - 1)
);

export const matchSchema = z.union([
  z.object({
    _action: z.literal("REPORT_SCORE"),
    winnerTeamId: id,
    position: reportedMatchPosition,
    playerIds: reportedMatchPlayerIds,
  }),
  z.object({
    _action: z.literal("UNDO_REPORT_SCORE"),
    position: reportedMatchPosition,
  }),
  z.object({
    _action: z.literal("REOPEN_MATCH"),
  }),
]);

export const bracketSchema = z.union([
  z.object({
    _action: z.literal("START_TOURNAMENT"),
  }),
  z.object({
    _action: z.literal("FINALIZE_TOURNAMENT"),
  }),
]);
