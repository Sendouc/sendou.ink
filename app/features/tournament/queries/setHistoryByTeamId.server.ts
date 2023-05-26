import { sql } from "~/db/sql";
import type { User } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
import { removeDuplicatesByProperty } from "~/utils/arrays";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select 
      "m"."id" as "tournamentMatchId",
      "m"."opponentOne" ->> '$.score' as "opponentOneScore",
      "m"."opponentTwo" ->> '$.score' as "opponentTwoScore",
      json_group_array(
        json_object(
          'mode',
          "r"."mode",
          'wasWinner',
          "r"."winnerTeamId" == @tournamentTeamId
        )
      ) as "matches"
    from "TournamentMatch" as "m"
    left join "TournamentMatchGameResult" as "r" on "m"."id" = "r"."matchId"
    where 
    (
        "m"."opponentOne" ->> '$.id' = @tournamentTeamId
      or
        "m"."opponentTwo" ->> '$.id' = @tournamentTeamId
    )
    and
    (
        "m"."opponentOne" ->> '$.result' = 'win'
      or
        "m"."opponentTwo" ->> '$.result' = 'win'
    )
    group by "m"."id"
  )
  select 
    "q1".*,
    json_group_array(
      json_object(
        'id',
        "u"."id",
        'discordName',
        "u"."discordName",
        'discordAvatar',
        "u"."discordAvatar",
        'discordId',
        "u"."discordId",
        'customUrl',
        "u"."customUrl"
      )
    ) as "players"
  from "q1"
  left join "TournamentMatchGameResult" as "r" on "q1"."tournamentMatchId" = "r"."matchId"
  left join "TournamentMatchGameResultParticipant" as "p" on "r"."id" = "p"."matchGameResultId"
  left join "User" as "u" on "p"."userId" = "u"."id"
  -- filters out own team results
  inner join "TournamentTeamMember" as "m" on "p"."userId" = "m"."userId" 
    and "m"."tournamentTeamId" != @tournamentTeamId
  group by "q1"."tournamentMatchId"
`);

interface SetHistoryByTeamIdItem {
  tournamentMatchId: number;
  opponentOneScore: number | null;
  opponentTwoScore: number | null;
  matches: {
    mode: ModeShort;
    wasWinner: number;
  }[];
  players: {
    userId: number;
  }[];
}

export function setHistoryByTeamId(
  tournamentTeamId: number
): Array<SetHistoryByTeamIdItem> {
  const rows = stm.all({ tournamentTeamId });

  return rows.map((row) => {
    return {
      ...row,
      matches: parseDBArray(row.matches),
      // TODO: there is probably a way to do this in SQL
      players: removeDuplicatesByProperty(
        parseDBArray(row.players),
        (u: Pick<User, "id">) => u.id
      ),
    };
  });
}
