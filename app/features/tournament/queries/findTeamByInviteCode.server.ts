import { sql } from "~/db/sql";

const stm = sql.prepare(/*sql */ `
  select 
    "TournamentTeam"."id",
    "TournamentTeam"."calendarEventId"
  from "TournamentTeam"
    where "TournamentTeam"."inviteCode" = @inviteCode
`);

export function findByInviteCode(inviteCode: string) {
  return stm.get({ inviteCode }) as {
    id: number;
    calendarEventId: number;
  } | null;
}
