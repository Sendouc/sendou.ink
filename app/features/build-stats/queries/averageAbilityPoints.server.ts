import { sql } from "~/db/sql";
import type { Ability, MainWeaponId } from "~/modules/in-game-lists";

const query = (includeWeaponId: boolean) => /* sql */ `
  select "BuildAbility"."ability", sum("BuildAbility"."abilityPoints") as "abilityPointsSum"
    from "BuildAbility"
    left join "BuildWeapon" on "BuildAbility"."buildId" = "BuildWeapon"."buildId"
  ${
    includeWeaponId
      ? /* sql */ `where "BuildWeapon"."weaponSplId" = @weaponSplId`
      : ""
  }
  group by "BuildAbility"."ability"
`;

const findByWeaponIdStm = sql.prepare(query(true));
const findAllStm = sql.prepare(query(false));

export interface AverageAbilityPointsResult {
  ability: Ability;
  abilityPointsSum: number;
}

export function averageAbilityPoints(
  weaponSplId?: MainWeaponId | null
): Array<AverageAbilityPointsResult> {
  const stm = typeof weaponSplId === "number" ? findByWeaponIdStm : findAllStm;

  return stm.all({ weaponSplId });
}
