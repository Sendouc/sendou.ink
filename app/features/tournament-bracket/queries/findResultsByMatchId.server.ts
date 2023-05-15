import { sql } from "~/db/sql";
import type { TournamentMatchGameResult, User } from "~/db/types";
import type { TournamentMaplistSource } from "~/modules/tournament-map-list-generator";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select
    "TournamentMatchGameResult"."id",
    "TournamentMatchGameResult"."winnerTeamId",
    "TournamentMatchGameResult"."stageId",
    "TournamentMatchGameResult"."mode",
    "TournamentMatchGameResult"."source",
    "TournamentMatchGameResult"."createdAt",
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
  source: TournamentMaplistSource;
  createdAt: TournamentMatchGameResult["createdAt"];
}

export function findResultsByMatchId(
  matchId: number
): Array<FindResultsByMatchIdResult> {
  const rows = stm.all({ matchId });

  return rows.map((row) => ({
    ...row,
    source: isNaN(row.source) ? row.source : Number(row.source),
    participantIds: parseDBArray(row.participantIds),
  }));
}
