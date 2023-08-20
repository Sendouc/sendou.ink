import { sql } from "~/db/sql";
import { seasonObject } from "~/features/mmr/season";
import type { MainWeaponId, ModeShort, StageId } from "~/modules/in-game-lists";
import { dateToDatabaseTimestamp } from "~/utils/dates";

const stm = sql.prepare(/* sql */ `
  select
    "ReportedWeapon"."weaponSplId",
    "ReportedWeapon"."userId" as "weaponUserId",
    "GroupMatchMap"."winnerGroupId",
    "GroupMember"."groupId" as "ownerGroupId",
    ( 
      select "groupId" 
      from "GroupMember" 
      where "GroupMember"."userId" = "ReportedWeapon"."userId"
      and "GroupMember"."groupId" = "GroupMatch"."alphaGroupId" 
        or "GroupMember"."groupId" = "GroupMatch"."bravoGroupId"
    ) as "weaponUserGroupId"
  from "GroupMember"
  left join "Group" on "Group"."id" = "GroupMember"."groupId"
  inner join "GroupMatch" on 
    "GroupMatch"."alphaGroupId" = "Group"."id" 
      or "GroupMatch"."bravoGroupId" = "Group"."id"
  left join "GroupMatchMap" on "GroupMatchMap"."matchId" = "GroupMatch"."id"
  left join "ReportedWeapon" on "ReportedWeapon"."groupMatchMapId" = "GroupMatchMap"."id"
  where
    "GroupMember"."userId" = @userId
    and "GroupMatch"."createdAt" between @starts and @ends
    and "GroupMatchMap"."mode" = @mode
    and "GroupMatchMap"."stageId" = @stageId
    and "GroupMatchMap"."winnerGroupId" is not null
`);

interface WeaponUsageStat {
  type: "SELF" | "MATE" | "ENEMY";
  weaponSplId: MainWeaponId;
  count: number;
}

export function weaponUsageStats({
  userId,
  mode,
  stageId,
  season,
}: {
  userId: number;
  mode: ModeShort;
  stageId: StageId;
  season: number;
}) {
  const { starts, ends } = seasonObject(season);

  const rows = stm.all({
    starts: dateToDatabaseTimestamp(starts),
    ends: dateToDatabaseTimestamp(ends),
    userId,
    mode,
    stageId,
  }) as Array<{
    weaponSplId: MainWeaponId;
    weaponUserId: number;
    winnerGroupId: number;
    ownerGroupId: number;
    weaponUserGroupId: number;
  }>;

  const result: WeaponUsageStat[] = [];

  const addDelta = (stat: Omit<WeaponUsageStat, "count">) => {
    const existing = result.find(
      (s) => s.weaponSplId === stat.weaponSplId && s.type === stat.type
    );

    if (existing) {
      existing.count += 1;
    } else {
      result.push({ ...stat, count: 1 });
    }
  };
  for (const row of rows) {
    const type =
      row.weaponUserId === userId
        ? "SELF"
        : row.weaponUserGroupId === row.ownerGroupId
        ? "MATE"
        : "ENEMY";

    addDelta({
      type,
      weaponSplId: row.weaponSplId,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}
