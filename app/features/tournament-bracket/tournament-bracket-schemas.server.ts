import { z } from "zod";
import { id, modeShort, safeJSONParse, stageId } from "~/utils/zod";
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
    stageId,
    mode: modeShort,
    source: z.string(),
  }),
  z.object({
    _action: z.literal("UNDO_REPORT_SCORE"),
    position: reportedMatchPosition,
  }),
]);
