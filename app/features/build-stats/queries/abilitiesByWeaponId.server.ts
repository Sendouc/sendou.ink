import { sql } from "~/db/sql";
import type { Ability, MainWeaponId } from "~/modules/in-game-lists";

const stm = sql.prepare(/* sql */ `
  select 
    json_group_array(
      json_object(
        'ability',
        "BuildAbility"."ability",
        'abilityPoints',
        "BuildAbility"."abilityPoints"
      )
    ) as "abilities"
  from "BuildAbility"
  left join "BuildWeapon" on "BuildWeapon"."buildId" = "BuildAbility"."buildId"
  where "BuildWeapon"."weaponSplId" = @weaponSplId
  group by "BuildAbility"."buildId"
`);

export interface AbilitiesByWeapon {
  abilities: Array<{
    ability: Ability;
    abilityPoints: number;
  }>;
}

export function abilitiesByWeaponId(
  weaponSplId: MainWeaponId
): Array<AbilitiesByWeapon> {
  return stm
    .all({ weaponSplId })
    .map((row) => ({ abilities: JSON.parse(row.abilities) }));
}
