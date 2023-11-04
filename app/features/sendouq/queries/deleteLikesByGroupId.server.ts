import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  delete from "GroupLike"
  where "likerGroupId" = @groupId
    or "targetGroupId" = @groupId
`);

export function deleteLikesByGroupId(groupId: number) {
  stm.run({ groupId });
}
