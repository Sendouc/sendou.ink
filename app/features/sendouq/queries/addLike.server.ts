import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  insert into "GroupLike" ("likerGroupId", "targetGroupId")
    values (@likerGroupId, @targetGroupId)
`);

export function addLike({
  likerGroupId,
  targetGroupId,
}: {
  likerGroupId: number;
  targetGroupId: number;
}) {
  stm.run({ likerGroupId, targetGroupId });
}
