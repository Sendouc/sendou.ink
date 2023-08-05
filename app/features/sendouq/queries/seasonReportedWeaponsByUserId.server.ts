import { sql } from "~/db/sql";
import { type RankingSeason, seasonObject } from "~/features/mmr/season";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { dateToDatabaseTimestamp } from "~/utils/dates";

// xxx: tournament weapons
const stm = sql.prepare(/* sql */ `
  select
    "ReportedWeapon"."weaponSplId",
    count(*) as "count"
  from
    "ReportedWeapon"
  left join "GroupMatchMap" on "GroupMatchMap"."id" = "ReportedWeapon"."groupMatchMapId"
  left join "GroupMatch" on "GroupMatch"."id" = "GroupMatchMap"."matchId"
  where
    "ReportedWeapon"."userId" = @userId
    and "GroupMatch"."createdAt" between @starts and @ends
  group by "ReportedWeapon"."weaponSplId"
  order by "count" desc
`);

export function seasonReportedWeaponsByUserId({
  userId,
  season,
}: {
  userId: number;
  season: RankingSeason["nth"];
}) {
  const { starts, ends } = seasonObject(season);

  return stm.all({
    userId,
    starts: dateToDatabaseTimestamp(starts),
    ends: dateToDatabaseTimestamp(ends),
  }) as Array<{ weaponSplId: MainWeaponId; count: number }>;
}
