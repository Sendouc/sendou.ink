import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  select 
    "TournamentMatch"."id" as "matchId",
    "TournamentRound"."number" as "roundNumber",
    "TournamentGroup"."number" as "groupNumber"
  from "TournamentMatch"
  left join "TournamentRound" on "TournamentRound"."id" = "TournamentMatch"."roundId"
  left join "TournamentGroup" on "TournamentGroup"."id" = "TournamentMatch"."groupId"
  left join "TournamentStage" on "TournamentStage"."id" = "TournamentMatch"."stageId"
  where "TournamentStage"."tournamentId" = @tournamentId
`);

export interface FindAllMatchesByTournamentIdMatch {
  matchId: number;
  roundNumber: number;
  groupNumber: number;
}

export function findAllMatchesByTournamentId(
  tournamentId: number
): Array<FindAllMatchesByTournamentIdMatch> {
  return stm.all({ tournamentId });
}
