import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "AllTeamMember"
    set "leftAt" = strftime('%s', 'now')
  where "teamId" = @teamId
    and "userId" = @userId
    and "isOwner" = 0
`); // isOwner check to make sure the owner doesn't leave causing a bad state

export function leaveTeam({
	teamId,
	userId,
}: {
	teamId: number;
	userId: number;
}) {
	stm.run({ teamId, userId });
}
