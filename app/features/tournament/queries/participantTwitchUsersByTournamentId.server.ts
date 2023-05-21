import { sql } from "~/db/sql";
import type { User } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select 
    "User"."id",
    "User"."twitch"
  from "User"
  left join "TournamentTeamMember" on "TournamentTeamMember"."userId" = "User"."id"
  left join "TournamentTeam" on "TournamentTeam"."id" = "TournamentTeamMember"."tournamentTeamId"
  where "TournamentTeam"."tournamentId" = @tournamentId
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
