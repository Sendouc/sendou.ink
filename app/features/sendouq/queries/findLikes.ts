import { sql } from "~/db/sql";
import type { GroupLike } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "GroupLike"."likerGroupId",
    "GroupLike"."targetGroupId"
  from
    "GroupLike"
  where
    "GroupLike"."likerGroupId" = @groupId
    or "GroupLike"."targetGroupId" = @groupId
  order by
    "GroupLike"."createdAt" desc
`);

export function findLikes(
  groupId: number
): Pick<GroupLike, "likerGroupId" | "targetGroupId">[] {
  return stm.all({ groupId }) as any;
}
