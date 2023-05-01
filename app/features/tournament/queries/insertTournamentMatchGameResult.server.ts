import { sql } from "~/db/sql";
import type { TournamentMatchGameResult } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  insert into "TournamentMatchGameResult"
    ("matchId", "stageId", "mode", "winnerTeamId", "reporterId", "number")
  values
    (@matchId, @stageId, @mode, @winnerTeamId, @reporterId, @number)
  returning *
`);

export function insertTournamentMatchGameResult(
  args: Omit<TournamentMatchGameResult, "id" | "createdAt">
) {
  return stm.get(args) as TournamentMatchGameResult;
}
