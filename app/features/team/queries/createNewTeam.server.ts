import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { sql } from "~/db/sql";
import type { Team } from "~/db/types";

const createTeamStm = sql.prepare(/* sql */ `
  insert into "AllTeam"
    ("name", "customUrl", "inviteCode")
    values (@name, @customUrl, @inviteCode)
  returning *
`);

const createMemberStm = sql.prepare(/* sql */ `
  insert into "AllTeamMember"
    ("teamId", "userId", "isOwner")
    values (@teamId, @userId, @isOwner)
`);

export const createNewTeam = sql.transaction(
  ({
    name,
    customUrl,
    captainId,
  }: {
    name: string;
    customUrl: string;
    captainId: number;
  }) => {
    const team = createTeamStm.get({
      name,
      customUrl,
      inviteCode: nanoid(INVITE_CODE_LENGTH),
    }) as Team;

    createMemberStm.run({
      teamId: team.id,
      userId: captainId,
      isOwner: 1,
    });
  }
);
