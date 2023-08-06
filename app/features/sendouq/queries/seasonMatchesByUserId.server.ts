import { sql } from "~/db/sql";
import type { GroupMatch, GroupMatchMap, User } from "~/db/types";
import { type RankingSeason, seasonObject } from "~/features/mmr/season";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";

const MATCHES_PER_PAGE = 8;

const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "GroupMatch"."id",
      "GroupMatch"."alphaGroupId",
      "GroupMatch"."bravoGroupId",
      "GroupMatch"."createdAt"
    from "GroupMatch"
    left join "Group" on 
      "GroupMatch"."alphaGroupId" = "Group"."id" or 
      "GroupMatch"."bravoGroupId" = "Group"."id"
    left join "GroupMember" on "Group"."id" = "GroupMember"."groupId"
    where "GroupMember"."userId" = @userId
      and "GroupMatch"."createdAt" between @starts and @ends
    order by "GroupMatch"."id" desc
    limit ${MATCHES_PER_PAGE}
    offset ${MATCHES_PER_PAGE} * (@page - 1)
  ),
  "q2" as (
    select
      "q1".*,
      json_group_array(
        "GroupMatchMap"."winnerGroupId"
      ) as "winnerGroupIds"
    from
      "q1"
    left join "GroupMatchMap" on "q1"."id" = "GroupMatchMap"."matchId"
    where "GroupMatchMap"."winnerGroupId" is not null
    group by "q1"."id"
  ), "q3" as (
    select 
      "q2".*,
      json_group_array(
        json_object(
          'id', "User"."id",
          'discordName', "User"."discordName",
          'discordId', "User"."discordId",
          'discordAvatar', "User"."discordAvatar"
        )
      ) as "groupAlphaMembers"
    from "q2"
    left join "Group" on "q2"."alphaGroupId" = "Group"."id"
    left join "GroupMember" on "Group"."id" = "GroupMember"."groupId"
    left join "User" on "GroupMember"."userId" = "User"."id"
    group by "q2"."id"
  )
  select 
    "q3".*,
    json_group_array(
      json_object(
        'id', "User"."id",
        'discordName', "User"."discordName",
        'discordId', "User"."discordId",
        'discordAvatar', "User"."discordAvatar"
      )
    ) as "groupBravoMembers"
  from "q3"
  left join "Group" on "q3"."bravoGroupId" = "Group"."id"
  left join "GroupMember" on "Group"."id" = "GroupMember"."groupId"
  left join "User" on "GroupMember"."userId" = "User"."id"
  group by "q3"."id"
  order by "q3"."id" desc
`);

const weaponsStm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "ReportedWeapon"."userId",
      "ReportedWeapon"."weaponSplId",
      count(*) as "count"
    from
      "GroupMatch"
    left join "GroupMatchMap" on "GroupMatch"."id" = "GroupMatchMap"."matchId"
    left join "ReportedWeapon" on "GroupMatchMap"."id" = "ReportedWeapon"."groupMatchMapId"
    where "GroupMatch"."id" = @id
    group by "ReportedWeapon"."userId", "ReportedWeapon"."weaponSplId"
    order by "count" desc
  )
  select
    "q1"."userId",
    "q1"."weaponSplId"
  from "q1"
  group by "q1"."userId"
`);

interface SeasonMatchByUserId {
  id: GroupMatch["id"];
  alphaGroupId: GroupMatch["alphaGroupId"];
  bravoGroupId: GroupMatch["bravoGroupId"];
  winnerGroupIds: Array<GroupMatchMap["winnerGroupId"]>;
  createdAt: GroupMatch["createdAt"];
  groupAlphaMembers: Array<{
    id: User["id"];
    discordName: User["discordName"];
    discordId: User["discordId"];
    discordAvatar: User["discordAvatar"];
    weaponSplId?: MainWeaponId;
  }>;
  groupBravoMembers: Array<{
    id: User["id"];
    discordName: User["discordName"];
    discordId: User["discordId"];
    discordAvatar: User["discordAvatar"];
    weaponSplId?: MainWeaponId;
  }>;
}

export function seasonMatchesByUserId({
  userId,
  season,
  page,
}: {
  userId: number;
  season: RankingSeason["nth"];
  page: number;
}): SeasonMatchByUserId[] {
  const { starts, ends } = seasonObject(season);

  const rows = stm.all({
    userId,
    starts: dateToDatabaseTimestamp(starts),
    ends: dateToDatabaseTimestamp(ends),
    page,
  }) as any;

  return rows.map((row: any) => {
    const weapons = weaponsStm.all({ id: row.id }) as any;

    return {
      ...row,
      winnerGroupIds: parseDBArray(row.winnerGroupIds),
      groupAlphaMembers: parseDBJsonArray(row.groupAlphaMembers).map(
        (member: any) => ({
          ...member,
          weaponSplId: weapons.find((w: any) => w.userId === member.id)
            ?.weaponSplId,
        })
      ),
      groupBravoMembers: parseDBJsonArray(row.groupBravoMembers).map(
        (member: any) => ({
          ...member,
          weaponSplId: weapons.find((w: any) => w.userId === member.id)
            ?.weaponSplId,
        })
      ),
    };
  });
}

const pagesStm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "GroupMatch"."id"
    from "GroupMatch"
    left join "Group" on 
      "GroupMatch"."alphaGroupId" = "Group"."id" or 
      "GroupMatch"."bravoGroupId" = "Group"."id"
    left join "GroupMember" on "Group"."id" = "GroupMember"."groupId"
    left join "GroupMatchMap" on "GroupMatch"."id" = "GroupMatchMap"."matchId"
    where "GroupMember"."userId" = @userId
      and "GroupMatch"."createdAt" between @starts and @ends
      and "GroupMatchMap"."winnerGroupId" is not null
    group by "GroupMatch"."id"
  )
  select
    count(*) as "count"
  from "q1"
`);

export function seasonMatchesByUserIdPagesCount({
  userId,
  season,
}: {
  userId: number;
  season: RankingSeason["nth"];
}): number {
  const { starts, ends } = seasonObject(season);

  const row = pagesStm.get({
    userId,
    starts: dateToDatabaseTimestamp(starts),
    ends: dateToDatabaseTimestamp(ends),
  }) as any;

  return Math.ceil((row.count as number) / MATCHES_PER_PAGE);
}
