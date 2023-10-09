import { sql } from "~/db/sql";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";
import type { LookingGroupWithInviteCode } from "../q-types";

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
      "GroupMember"."role",
      "GroupMember"."note",
      json_group_array("UserWeapon"."weaponSplId") as "weapons"
    from
      "Group"
    left join "GroupMember" on "GroupMember"."groupId" = "Group"."id"
    left join "User" on "User"."id" = "GroupMember"."userId"
    left join "UserWeapon" on "UserWeapon"."userId" = "User"."id"
    left join "GroupMatch" on "GroupMatch"."alphaGroupId" = "Group"."id"
      or "GroupMatch"."bravoGroupId" = "Group"."id"
    where
      "Group"."id" = @ownGroupId
      and "Group"."status" = 'PREPARING'
      and ("UserWeapon"."order" is null or "UserWeapon"."order" <= 3)
    group by "User"."id"
    order by "UserWeapon"."order" asc
  )
  select 
    "q1"."id",
    "q1"."mapListPreference",
    "q1"."inviteCode",
    json_group_array(
      json_object(
        'id', "q1"."userId",
        'discordId', "q1"."discordId",
        'discordName', "q1"."discordName",
        'discordAvatar', "q1"."discordAvatar",
        'role', "q1"."role",
        'note', "q1"."note",
        'weapons', "q1"."weapons"
      )
    ) as "members"
  from "q1"
  group by "q1"."id"
  order by "q1"."createdAt" desc
`);

export function findPreparingGroup(
  ownGroupId: number,
): LookingGroupWithInviteCode {
  const row = stm.get({ ownGroupId }) as any;

  return {
    id: row.id,
    mapListPreference: row.mapListPreference,
    inviteCode: row.inviteCode,
    members: parseDBJsonArray(row.members).map((member: any) => {
      const weapons = parseDBArray(member.weapons);

      return {
        ...member,
        weapons: weapons.length > 0 ? weapons : undefined,
      };
    }),
  };
}
