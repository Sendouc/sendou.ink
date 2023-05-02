import { sql } from "~/db/sql";
import type { TournamentMatchGameResult } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "id",
    "winnerTeamId"
  from "TournamentMatchGameResult"
  where "TournamentMatchGameResult"."matchId" = @matchId
  order by "TournamentMatchGameResult"."number" asc
`);

export function findResultsByMatchId(matchId: number) {
  return stm.all({ matchId }) as Pick<
    TournamentMatchGameResult,
    "id" | "winnerTeamId"
  >[];
}
