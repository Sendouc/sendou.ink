import { sql } from "~/db/sql";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "Group"."id",
      "Group"."createdAt",
      "User"."discordId",
      "User"."discordName",
      "User"."discordAvatar",
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
      and ("Group"."latestActionAt" > (unixepoch() - 1800) or "Group"."id" = @ownGroupId)
      and "GroupMatch"."id" is null
      and "UserWeapon"."order" <= 3
    group by "User"."id"
    order by "UserWeapon"."order" asc
  )
  select 
    "q1"."id",
    json_group_array(
      json_object(
        'discordId', "q1"."discordId",
        'discordName', "q1"."discordName",
        'discordAvatar', "q1"."discordAvatar",
        'weapons', "q1"."weapons"
      )
    ) as "members"
  from "q1"
  group by "q1"."id"
  order by "q1"."createdAt" desc
`);

export type LookingGroup = {
  id: number;
  members: {
    discordId: string;
    discordName: string;
    discordAvatar: string;
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
