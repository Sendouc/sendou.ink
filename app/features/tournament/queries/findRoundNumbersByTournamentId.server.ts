import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  select
    "TournamentStage"."id" as "stageId",
    "TournamentRound"."number" as "roundNumber",
    "TournamentGroup"."number" as "groupNumber"
  from "TournamentStage"
  left join "TournamentGroup" on "TournamentGroup"."stageId" = "TournamentStage"."id"
  left join "TournamentRound" on "TournamentRound"."groupId" = "TournamentGroup"."id"
  where "TournamentStage"."tournamentId" = @tournamentId
  group by "TournamentStage"."id", "TournamentRound"."number", "TournamentGroup"."number"
`);

export function findRoundNumbersByTournamentId(tournamentId: number) {
  return stm.all({ tournamentId }) as Array<{
    stageId: number;
    roundNumber: number;
    groupNumber: number;
  }>;
}
