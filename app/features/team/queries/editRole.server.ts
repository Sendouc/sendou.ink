import { sql } from "~/db/sql";
import type { MemberRole } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  update "AllTeamMember"
  set "role" = @role
  where "teamId" = @teamId
    and "userId" = @userId
`);

export function editRole({
  userId,
  teamId,
  role,
}: {
  userId: number;
  teamId: number;
  role: MemberRole | null;
}) {
  return stm.run({ userId, teamId, role });
}
