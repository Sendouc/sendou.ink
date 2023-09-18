import { sql } from "~/db/sql";
import type { Group, GroupMember, User } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  with "GroupMemberWithWeapon" as (
    select
      "GroupMember".*,
      json_group_array("UserWeapon"."weaponSplId") as "weapons"
    from "GroupMember"
      left join "UserWeapon" on "UserWeapon"."userId" = "GroupMember"."userId"
    where
      "GroupMember"."groupId" = @id
        and ("UserWeapon"."order" is null or "UserWeapon"."order" <= 3)
    group by "GroupMember"."userId"
  )
  select
    "Group"."id",
    "Group"."chatCode",
    "AllTeam"."name" as "teamName",
    "AllTeam"."customUrl" as "teamCustomUrl",
    "UserSubmittedImage"."url" as "teamAvatarUrl",
    json_group_array(
      json_object(
        'id', "GroupMemberWithWeapon"."userId",
        'discordId', "User"."discordId",
        'discordName', "User"."discordName",
        'discordAvatar', "User"."discordAvatar",
        'role', "GroupMemberWithWeapon"."role",
        'customUrl', "User"."customUrl",
        'inGameName', "User"."inGameName",
        'weapons', "GroupMemberWithWeapon"."weapons",
        'chatNameColor', IIF(COALESCE("User"."patronTier", 0) >= 2, "User"."css" ->> 'chat', null)
      )
    ) as "members"
  from
    "Group"
  left join "GroupMemberWithWeapon" on "GroupMemberWithWeapon"."groupId" = "Group"."id"
  left join "User" on "User"."id" = "GroupMemberWithWeapon"."userId"
  left join "AllTeam" on "AllTeam"."id" = "Group"."teamId"
  left join "UserSubmittedImage" on "AllTeam"."avatarImgId" = "UserSubmittedImage"."id"
  where
    "Group"."id" = @id
  group by "Group"."id"
  order by "GroupMemberWithWeapon"."userId" asc
`);

export interface GroupForMatch {
  id: Group["id"];
  chatCode: Group["chatCode"];
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
    inGameName: User["inGameName"];
    weapons: Array<MainWeaponId>;
    chatNameColor: string | null;
  }>;
}

export function groupForMatch(id: number) {
  const row = stm.get({ id }) as any;
  if (!row) return null;

  return {
    id: row.id,
    chatCode: row.chatCode,
    team: row.teamName
      ? {
          name: row.teamName,
          avatarUrl: row.teamAvatarUrl,
          customUrl: row.teamCustomUrl,
        }
      : undefined,
    members: JSON.parse(row.members).map((m: any) => ({
      ...m,
      weapons: parseDBArray(m.weapons),
    })),
  } as GroupForMatch;
}
