import { sql } from "~/db/sql.server";
import type { User } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select 
    "User"."id",
    "User"."twitch"
  from "User"
  left join "TournamentTeamMember" on "TournamentTeamMember"."userId" = "User"."id"
  left join "TournamentTeam" on "TournamentTeam"."id" = "TournamentTeamMember"."tournamentTeamId"
  left join "TournamentTeamCheckIn" on "TournamentTeamCheckIn"."tournamentTeamId" = "TournamentTeam"."id"
  where "TournamentTeam"."tournamentId" = @tournamentId
    and "TournamentTeamCheckIn"."checkedInAt" is not null
    and "User"."twitch" is not null
`);

// const testStm = sql.prepare(/* sql */ `
//   select
//     "User"."id",
//     "User"."twitch"
//   from "User"
//   where "User"."twitch" is not null
// `);

export function participantTwitchUsersByTournamentId(tournamentId: number) {
  return stm.all({ tournamentId }) as Array<Pick<User, "id" | "twitch">>;
}
