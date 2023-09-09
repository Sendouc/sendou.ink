import { z } from "zod";
import { _action, id, safeJSONParse } from "~/utils/zod";
import { TOURNAMENT } from "../tournament/tournament-constants";

const reportedMatchPlayerIds = z.preprocess(
  safeJSONParse,
  z.array(id).length(TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL * 2),
);

const reportedMatchPosition = z.preprocess(
  Number,
  z
    .number()
    .int()
    .min(0)
    .max(Math.max(...TOURNAMENT.AVAILABLE_BEST_OF) - 1),
);

export const matchSchema = z.union([
  z.object({
    _action: _action("REPORT_SCORE"),
    winnerTeamId: id,
    position: reportedMatchPosition,
    playerIds: reportedMatchPlayerIds,
  }),
  z.object({
    _action: _action("UNDO_REPORT_SCORE"),
    position: reportedMatchPosition,
  }),
  z.object({
    _action: _action("REOPEN_MATCH"),
  }),
]);

export const bracketSchema = z.union([
  z.object({
    _action: _action("START_TOURNAMENT"),
  }),
  z.object({
    _action: _action("FINALIZE_TOURNAMENT"),
  }),
]);
