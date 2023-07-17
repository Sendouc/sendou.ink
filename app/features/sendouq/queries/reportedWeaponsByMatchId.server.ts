import { sql } from "~/db/sql";
import type { ReportedWeapon } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "ReportedWeapon"."groupMatchMapId",
    "ReportedWeapon"."weaponSplId",
    "ReportedWeapon"."userId"
  from
    "ReportedWeapon"
  left join "GroupMatchMap" on "GroupMatchMap"."id" = "ReportedWeapon"."groupMatchMapId"
  where "GroupMatchMap"."matchId" = @matchId
  order by 
    "ReportedWeapon"."weaponSplId" asc, "ReportedWeapon"."userId" asc
`);

export function reportedWeaponsByMatchId(matchId: number) {
  return stm.all({ matchId }) as Array<ReportedWeapon>;
}
