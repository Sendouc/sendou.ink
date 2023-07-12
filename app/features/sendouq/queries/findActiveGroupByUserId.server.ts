import invariant from "tiny-invariant";
import { sql } from "~/db/sql";
import type { Group } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "Group"."id",
    "Group"."status",
    "GroupMatch"."id" as "matchId"
  from
    "Group"
  left join "GroupMember" on "GroupMember"."groupId" = "Group"."id"
  left join "GroupMatch" on "GroupMatch"."alphaGroupId" = "Group"."id"
    or "GroupMatch"."bravoGroupId" = "Group"."id"
  where
    "Group"."status" != 'INACTIVE'
    and "GroupMember"."userId" = @userId
`);

type ActiveGroup = Pick<Group, "id" | "status"> & { matchId?: number };

export function findActiveGroupByUserId(
  userId: number
): ActiveGroup | undefined {
  const groups = stm.all({ userId }) as any;

  invariant(groups.length <= 1, "User can't be in more than one group");

  return groups[0];
}
