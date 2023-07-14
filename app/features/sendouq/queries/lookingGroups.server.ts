import { sql } from "~/db/sql";
import type { Group, GroupMember } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";

// groups visible for longer to make development easier
const SECONDS_TILL_STALE =
  process.env.NODE_ENV === "development" ? 1_000_000 : 1800;

const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "Group"."id",
      "Group"."createdAt",
      "Group"."mapListPreference",
      "Group"."isRanked",
      "User"."id" as "userId",
      "User"."discordId",
      "User"."discordName",
      "User"."discordAvatar",
      "GroupMember"."role",
      json_group_array("UserWeapon"."weaponSplId") as "weapons"
    from
      "Group"
    left join "GroupMember" on "GroupMember"."groupId" = "Group"."id"
    left join "User" on "User"."id" = "GroupMember"."userId"
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
    "q1"."isRanked",
    json_group_array(
      json_object(
        'id', "q1"."userId",
        'discordId', "q1"."discordId",
        'discordName', "q1"."discordName",
        'discordAvatar', "q1"."discordAvatar",
        'role', "q1"."role",
        'weapons', "q1"."weapons"
      )
    ) as "members"
  from "q1"
  group by "q1"."id"
  order by "q1"."createdAt" desc
`);

export type LookingGroup = {
  id: number;
  mapListPreference: Group["mapListPreference"];
  isRanked: Group["isRanked"];
  members: {
    id: number;
    discordId: string;
    discordName: string;
    discordAvatar: string;
    role: GroupMember["role"];
    weapons?: MainWeaponId[];
  }[];
};

export function findLookingGroups({
  maxGroupSize,
  ownGroupId,
}: {
  maxGroupSize: number;
  ownGroupId: number;
}): LookingGroup[] {
  return stm
    .all({ ownGroupId })
    .map((row: any) => {
      return {
        id: row.id,
        mapListPreference: row.mapListPreference,
        isRanked: row.isRanked,
        members: parseDBJsonArray(row.members).map((member: any) => {
          const weapons = parseDBArray(member.weapons);

          return {
            ...member,
            weapons: weapons.length > 0 ? weapons : undefined,
          };
        }),
      };
    })
    .filter((group: any) => group.members.length <= maxGroupSize);
}
