import { sql } from "~/db/sql";
import type { TournamentMatchGameResult, User } from "~/db/types";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select
    "TournamentMatchGameResult"."id",
    "TournamentMatchGameResult"."winnerTeamId",
    "TournamentMatchGameResult"."stageId",
    "TournamentMatchGameResult"."mode",
    json_group_array("TournamentMatchGameResultParticipant"."userId") as "participantIds"
  from "TournamentMatchGameResult"
  left join "TournamentMatchGameResultParticipant"
    on "TournamentMatchGameResultParticipant"."matchGameResultId" = "TournamentMatchGameResult"."id"
  where "TournamentMatchGameResult"."matchId" = @matchId
  group by "TournamentMatchGameResult"."id"
  order by "TournamentMatchGameResult"."number" asc
`);

interface FindResultsByMatchIdResult {
  id: TournamentMatchGameResult["id"];
  winnerTeamId: TournamentMatchGameResult["winnerTeamId"];
  stageId: TournamentMatchGameResult["stageId"];
  mode: TournamentMatchGameResult["mode"];
  participantIds: Array<User["id"]>;
}

export function findResultsByMatchId(
  matchId: number
): Array<FindResultsByMatchIdResult> {
  const rows = stm.all({ matchId });

  return rows.map((row) => ({
    ...row,
    participantIds: parseDBArray(row.participantIds),
  }));
}
