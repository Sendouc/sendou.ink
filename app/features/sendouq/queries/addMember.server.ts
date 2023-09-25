import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  insert into "GroupMember" (
    "groupId",
    "userId",
    "role"
  ) values (
    @groupId,
    @userId,
    'REGULAR'
  )
`);

export function addMember({
  groupId,
  userId,
}: {
  groupId: number;
  userId: number;
}) {
  stm.run({ groupId, userId });
}
