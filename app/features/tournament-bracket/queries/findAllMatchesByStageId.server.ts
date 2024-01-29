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
  where "TournamentStage"."id" = @stageId
`);

export interface FindAllMatchesByStageIdItem {
  matchId: number;
  roundNumber: number;
  groupNumber: number;
}

export function findAllMatchesByStageId(stageId: number) {
  return stm.all({ stageId }) as Array<FindAllMatchesByStageIdItem>;
}
