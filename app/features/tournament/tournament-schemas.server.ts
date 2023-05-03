import { z } from "zod";
import { id, modeShort, safeJSONParse, stageId } from "~/utils/zod";
import { TOURNAMENT } from "./tournament-constants";

export const registerSchema = z.union([
  z.object({
    _action: z.literal("UPSERT_TEAM"),
    teamName: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
  }),
  z.object({
    _action: z.literal("UPDATE_MAP_POOL"),
    mapPool: z.string(),
  }),
  z.object({
    _action: z.literal("DELETE_TEAM_MEMBER"),
    userId: id,
  }),
]);

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
