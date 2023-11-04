import { sql } from "~/db/sql.server";
import type { TournamentTeam, User } from "~/db/types";
import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";

const createTeamStm = sql.prepare(/*sql*/ `
  insert into "TournamentTeam" (
    "tournamentId",
    "inviteCode",
    "name",
    "prefersNotToHost"
  ) values (
    @tournamentId,
    @inviteCode,
    @name,
    @prefersNotToHost
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
    tournamentId,
    name,
    ownerId,
    prefersNotToHost,
  }: {
    tournamentId: TournamentTeam["tournamentId"];
    name: TournamentTeam["name"];
    ownerId: User["id"];
    prefersNotToHost: TournamentTeam["prefersNotToHost"];
  }) => {
    const team = createTeamStm.get({
      tournamentId,
      name,
      inviteCode: nanoid(INVITE_CODE_LENGTH),
      prefersNotToHost,
    }) as TournamentTeam;

    createMemberStm.run({ tournamentTeamId: team.id, userId: ownerId });
  },
);
