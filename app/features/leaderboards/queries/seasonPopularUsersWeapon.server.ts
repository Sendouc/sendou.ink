import { sql } from "~/db/sql";
import type { User } from "~/db/types";
import type { RankingSeason } from "~/features/mmr/season";
import { seasonObject } from "~/features/mmr/season";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { dateToDatabaseTimestamp } from "~/utils/dates";

// xxx: tournament weapons
const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "ReportedWeapon"."userId",
      "ReportedWeapon"."weaponSplId",
      count(*) as "count"
    from "ReportedWeapon"
    left join "GroupMatchMap" on "ReportedWeapon"."groupMatchMapId" = "GroupMatchMap"."id"
    left join "GroupMatch" on "GroupMatchMap"."matchId" = "GroupMatch"."id"
    where "GroupMatch"."createdAt" between @starts and @ends
    group by "ReportedWeapon"."userId", "ReportedWeapon"."weaponSplId"
    order by "count" desc
  )
  select
    "q1"."userId",
    "q1"."weaponSplId"
  from "q1"
  group by "q1"."userId"
`);

export type SeasonPopularUsersWeapon = Record<User["id"], MainWeaponId>;

export function seasonPopularUsersWeapon(
  season: RankingSeason["nth"]
): SeasonPopularUsersWeapon {
  const { starts, ends } = seasonObject(season);

  const rows = stm.all({
    season,
    starts: dateToDatabaseTimestamp(starts),
    ends: dateToDatabaseTimestamp(ends),
  }) as Array<{
    userId: User["id"];
    weaponSplId: MainWeaponId;
  }>;

  return Object.fromEntries(rows.map((r) => [r.userId, r.weaponSplId]));
}
