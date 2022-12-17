import { sql } from "~/db/sql";
import type { TournamentTeam, User } from "~/db/types";
import { nanoid } from "nanoid";

const createTeamStm = sql.prepare(/*sql*/ `
  insert into "TournamentTeam" (
    "calendarEventId",
    "inviteCode"
  ) values (
    @calendarEventId,
    @inviteCode
  ) returning *
`);

const createMemberStm = sql.prepare(/*sql*/ `
  insert into "TournamentTeamMember" (
    "tournamentTeamId",
    "userId",
    "isOwner"
  ) values (
    @tournamentTeamId,
    @userId,
    1
  )
`);

export const createTeam = sql.transaction(
  ({
    calendarEventId,
    ownerId,
  }: {
    calendarEventId: TournamentTeam["calendarEventId"];
    ownerId: User["id"];
  }) => {
    const team = createTeamStm.get({
      calendarEventId,
      inviteCode: nanoid(10),
    }) as TournamentTeam;

    createMemberStm.run({ tournamentTeamId: team.id, userId: ownerId });
  }
);
