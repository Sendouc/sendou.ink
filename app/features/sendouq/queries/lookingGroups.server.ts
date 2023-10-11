import { sql } from "~/db/sql";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";
import type { LookingGroupWithInviteCode } from "../q-types";

// groups visible for longer to make development easier
const SECONDS_TILL_STALE =
  process.env.NODE_ENV === "development" ? 1_000_000 : 1_800;

const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "Group"."id",
      "Group"."createdAt",
      "Group"."mapListPreference",
      "Group"."inviteCode",
      "User"."id" as "userId",
      "User"."discordId",
      "User"."discordName",
      "User"."discordAvatar",
      "User"."customUrl",
      "User"."vc",
      IIF(COALESCE("User"."patronTier", 0) >= 2, "User"."css" ->> 'chat', null) as "chatNameColor",
      "User"."languages",
      "PlusTier"."tier" as "plusTier",
      "GroupMember"."role",
      "GroupMember"."note",
      json_group_array("UserWeapon"."weaponSplId") as "weapons"
    from
      "Group"
    left join "GroupMember" on "GroupMember"."groupId" = "Group"."id"
    left join "User" on "User"."id" = "GroupMember"."userId"
    left join "PlusTier" on "PlusTier"."userId" = "User"."id"
    left join "UserWeapon" on "UserWeapon"."userId" = "User"."id"
    left join "GroupMatch" on "GroupMatch"."alphaGroupId" = "Group"."id"
      or "GroupMatch"."bravoGroupId" = "Group"."id"
    where
      "Group"."status" = 'ACTIVE'
      -- only groups that were active in the last half an hour as well as own group
      and ("Group"."latestActionAt" > (unixepoch() - ${SECONDS_TILL_STALE}) or "Group"."id" = @ownGroupId)
      and "GroupMatch"."id" is null
      and ("UserWeapon"."order" is null or "UserWeapon"."order" <= 3)
    group by "User"."id"
    order by "UserWeapon"."order" asc
  )
  select 
    "q1"."id",
    "q1"."mapListPreference",
    "q1"."inviteCode",
    "q1"."createdAt",
    json_group_array(
      json_object(
        'id', "q1"."userId",
        'discordId', "q1"."discordId",
        'discordName', "q1"."discordName",
        'discordAvatar', "q1"."discordAvatar",
        'chatNameColor', "q1"."chatNameColor",
        'customUrl', "q1"."customUrl",
        'plusTier', "q1"."plusTier",
        'role', "q1"."role",
        'note', "q1"."note",
        'weapons', "q1"."weapons",
        'vc', "q1"."vc",
        'languages', "q1"."languages"
      )
    ) as "members"
  from "q1"
  group by "q1"."id"
`);

export function findLookingGroups({
  minGroupSize,
  maxGroupSize,
  ownGroupId,
}: {
  minGroupSize?: number;
  maxGroupSize?: number;
  ownGroupId: number;
}): LookingGroupWithInviteCode[] {
  return stm
    .all({ ownGroupId })
    .map((row: any) => {
      return {
        id: row.id,
        mapListPreference: row.mapListPreference,
        inviteCode: row.inviteCode,
        createdAt: row.createdAt,
        members: parseDBJsonArray(row.members).map((member: any) => {
          const weapons = parseDBArray(member.weapons);

          return {
            ...member,
            weapons: weapons.length > 0 ? weapons : undefined,
            languages: member.languages ? member.languages.split(",") : [],
          };
        }),
      };
    })
    .filter((group: any) => {
      if (group.id === ownGroupId) return true;
      if (maxGroupSize && group.members.length > maxGroupSize) return false;
      if (minGroupSize && group.members.length < minGroupSize) return false;

      return true;
    });
}
