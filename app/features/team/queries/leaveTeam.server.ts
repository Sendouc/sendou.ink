import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "AllTeamMember"
    set "leftAt" = strftime('%s', 'now')
  where "teamId" = @teamId
    and "userId" = @userId
`);

export function leaveTeam({
  teamId,
  userId,
}: {
  teamId: number;
  userId: number;
}) {
  stm.run({ teamId, userId });
}
