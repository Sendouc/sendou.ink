import { sql } from "~/db/sql";
import type { TournamentTeam } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  select
    "TournamentTeam"."id",
    "TournamentTeam"."name",
    "TournamentTeam"."friendCode",
    "TournamentTeam"."checkedInAt",
    "TournamentTeam"."inviteCode"
  from
    "TournamentTeam"
    left join "TournamentTeamMember" on 
      "TournamentTeamMember"."tournamentTeamId" = "TournamentTeam"."id" 
      and "TournamentTeamMember"."isOwner" = 1
  where
    "TournamentTeam"."calendarEventId" = @calendarEventId
    and "TournamentTeamMember"."userId" = @userId
`);

type FindOwnTeam = Pick<
  TournamentTeam,
  "id" | "name" | "friendCode" | "checkedInAt" | "inviteCode"
> | null;

export function findOwnTeam({
  calendarEventId,
  userId,
}: {
  calendarEventId: number;
  userId: number;
}) {
  return stm.get({
    calendarEventId,
    userId,
  }) as FindOwnTeam;
}
