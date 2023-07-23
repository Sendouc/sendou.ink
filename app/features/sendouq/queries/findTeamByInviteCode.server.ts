import { sql } from "~/db/sql";
import type { Group } from "~/db/types";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select
    "Group"."id",
    "Group"."status",
    json_group_array(
      "User"."discordName"
    ) as "members"
  from
    "Group"
  left join "GroupMember" on "GroupMember"."groupId" = "Group"."id"
  left join "User" on "User"."id" = "GroupMember"."userId"
  where
    "Group"."inviteCode" = @inviteCode
      and "Group"."status" != 'INACTIVE'
  group by "Group"."id"
`);

export function findTeamByInviteCode(
  inviteCode: string
): { id: number; status: Group["status"]; members: string[] } | null {
  const row = stm.get({ inviteCode }) as any;
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    members: parseDBArray(row.members),
  };
}
