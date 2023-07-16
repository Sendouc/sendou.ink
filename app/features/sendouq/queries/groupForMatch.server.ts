import { sql } from "~/db/sql";
import type { Group, GroupMember, User } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "Group"."id",
    "AllTeam"."name" as "teamName",
    "AllTeam"."customUrl" as "teamCustomUrl",
    "UserSubmittedImage"."url" as "teamAvatarUrl",
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
  left join "AllTeam" on "AllTeam"."id" = "Group"."teamId"
  left join "UserSubmittedImage" on "AllTeam"."avatarImgId" = "UserSubmittedImage"."id"
  where
    "Group"."id" = @id
  group by "Group"."id"
`);

export interface GroupForMatch {
  id: Group["id"];
  team?: {
    name: string;
    avatarUrl: string | null;
    customUrl: string;
  };
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
    id: row.id,
    team: row.teamName
      ? {
          name: row.teamName,
          avatarUrl: row.teamAvatarUrl,
          customUrl: row.teamCustomUrl,
        }
      : undefined,
    members: JSON.parse(row.members),
  } as GroupForMatch;
}
