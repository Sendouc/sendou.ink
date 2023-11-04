import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  delete from "GroupLike"
    where "likerGroupId" = @likerGroupId
      and "targetGroupId" = @targetGroupId
`);

export function deleteLike({
  likerGroupId,
  targetGroupId,
}: {
  likerGroupId: number;
  targetGroupId: number;
}) {
  stm.run({ likerGroupId, targetGroupId });
}
