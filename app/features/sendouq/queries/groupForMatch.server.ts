import { sql } from "~/db/sql";
import type { GroupMember, User } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    json_group_array(
      json_object(
        'id', "GroupMember"."userId",
        'discordId', "User"."discordId",
        'discordName', "User"."discordName",
        'discordAvatar', "User"."discordAvatar",
        'role', "GroupMember"."role",
        'customUrl', "User"."customUrl"
      )
    ) as "members"
  from
    "Group"
  left join "GroupMember" on "GroupMember"."groupId" = "Group"."id"
  left join "User" on "User"."id" = "GroupMember"."userId"
  where
    "Group"."id" = @id
  group by "Group"."id"
`);

export interface GroupForMatch {
  members: Array<{
    id: GroupMember["userId"];
    discordId: User["discordId"];
    discordName: User["discordName"];
    discordAvatar: User["discordAvatar"];
    role: GroupMember["role"];
    customUrl: User["customUrl"];
  }>;
}

export function groupForMatch(id: number) {
  const row = stm.get({ id }) as any;
  if (!row) return null;

  return {
    ...row,
    members: JSON.parse(row.members),
  } as GroupForMatch;
}
