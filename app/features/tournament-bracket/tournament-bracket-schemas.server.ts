import { z } from "zod";
import {
  _action,
  id,
  modeShort,
  nullLiteraltoNull,
  numericEnum,
  safeJSONParse,
  stageId,
} from "~/utils/zod";
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

const point = z.number().int().min(0).max(100);
export const matchSchema = z.union([
  z.object({
    _action: _action("REPORT_SCORE"),
    winnerTeamId: id,
    position: reportedMatchPosition,
    playerIds: reportedMatchPlayerIds,
    points: z.preprocess(
      safeJSONParse,
      z
        .tuple([point, point])
        .nullish()
        .refine(
          (val) => {
            if (!val) return true;
            const [p1, p2] = val;

            if (p1 === p2) return false;
            if (p1 === 100 && p2 !== 0) return false;
            if (p2 === 100 && p1 !== 0) return false;

            return true;
          },
          {
            message:
              "Invalid points. Must not be equal & if one is 100, the other must be 0.",
          },
        ),
    ),
  }),
  z.object({
    _action: _action("UNDO_REPORT_SCORE"),
    position: reportedMatchPosition,
  }),
  z.object({
    _action: _action("REOPEN_MATCH"),
  }),
  z.object({
    _action: _action("SET_AS_CASTED"),
    twitchAccount: z.preprocess(
      nullLiteraltoNull,
      z.string().min(1).max(100).nullable(),
    ),
  }),
  z.object({
    _action: _action("LOCK"),
  }),
  z.object({
    _action: _action("UNLOCK"),
  }),
]);

export const bracketIdx = z.coerce.number().int().min(0).max(100);

const tournamentRoundMaps = z.object({
  roundId: id,
  list: z
    .array(
      z.object({
        mode: modeShort,
        stageId,
      }),
    )
    .nullish(),
  count: numericEnum([3, 5, 7]),
  type: z.enum(["BEST_OF"]),
});

export const bracketSchema = z.union([
  z.object({
    _action: _action("START_BRACKET"),
    bracketIdx,
    maps: z.preprocess(safeJSONParse, z.array(tournamentRoundMaps)),
  }),
  z.object({
    _action: _action("FINALIZE_TOURNAMENT"),
  }),
  z.object({
    _action: _action("BRACKET_CHECK_IN"),
    bracketIdx,
  }),
]);
