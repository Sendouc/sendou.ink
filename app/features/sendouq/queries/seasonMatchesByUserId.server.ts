import { sql } from "~/db/sql";
import type { GroupMatch, GroupMatchMap, User } from "~/db/types";
import { type RankingSeason, seasonObject } from "~/features/mmr/season";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";

// xxx: load weapons
// xxx: skip
const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "GroupMatch".*
    from "GroupMatch"
    left join "Group" on 
      "GroupMatch"."alphaGroupId" = "Group"."id" or 
      "GroupMatch"."bravoGroupId" = "Group"."id"
    left join "GroupMember" on "Group"."id" = "GroupMember"."groupId"
    where "GroupMember"."userId" = @userId
  ),
  "q2" as (
    select
      "GroupMatch"."id",
      "GroupMatch"."alphaGroupId",
      "GroupMatch"."bravoGroupId",
      json_group_array(
        "GroupMatchMap"."winnerGroupId"
      ) as "winnerGroupIds"
    from
      "q1" as "GroupMatch"
    left join "GroupMatchMap" on "GroupMatch"."id" = "GroupMatchMap"."matchId"
    where "GroupMatchMap"."winnerGroupId" is not null
      and "GroupMatch"."createdAt" between @starts and @ends
    group by "GroupMatch"."id"
  ), "q3" as (
    select 
        "q2".*,
        json_group_array(
          json_object(
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
`);

interface SeasonMatchByUserId {
  id: GroupMatch["id"];
  alphaGroupId: GroupMatch["alphaGroupId"];
  bravoGroupId: GroupMatch["bravoGroupId"];
  winnerGroupIds: Array<GroupMatchMap["winnerGroupId"]>;
  groupAlphaMembers: Array<{
    discordName: User["discordName"];
    discordId: User["discordId"];
    discordAvatar: User["discordAvatar"];
  }>;
  groupBravoMembers: Array<{
    discordName: User["discordName"];
    discordId: User["discordId"];
    discordAvatar: User["discordAvatar"];
  }>;
}

export function seasonMatchesByUserId({
  userId,
  season,
}: {
  userId: number;
  season: RankingSeason["nth"];
}): SeasonMatchByUserId[] {
  const { starts, ends } = seasonObject(season);

  const rows = stm.all({
    userId,
    starts: dateToDatabaseTimestamp(starts),
    ends: dateToDatabaseTimestamp(ends),
  }) as any;

  return rows.map((row: any) => ({
    ...row,
    winnerGroupIds: parseDBArray(row.winnerGroupIds),
    groupAlphaMembers: parseDBJsonArray(row.groupAlphaMembers),
    groupBravoMembers: parseDBJsonArray(row.groupBravoMembers),
  }));
}
