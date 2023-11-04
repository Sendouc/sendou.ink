import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  update "GroupMember"
  set "role" = 'MANAGER'
  where "userId" = @userId
    and "groupId" = @groupId
`);

export function addManagerRole({
  userId,
  groupId,
}: {
  userId: number;
  groupId: number;
}) {
  stm.run({ userId, groupId });
}
