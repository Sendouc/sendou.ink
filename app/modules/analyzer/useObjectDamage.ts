import { useSearchParams } from "@remix-run/react";
import { type MainWeaponId } from "../in-game-lists";
import { calculateDamage } from "./objectDamage";
import { buildStats } from "./stats";
import type { AnalyzedBuild, DamageType } from "./types";
import { possibleApValues, validatedWeaponIdFromSearchParams } from "./utils";

const ABILITY_POINTS_SP_KEY = "ap";
const DAMAGE_TYPE_SP_KEY = "dmg";

export function useObjectDamage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);
  const abilityPoints = validatedAbilityPointsFromSearchParams(searchParams);

  const analyzed = buildStats({
    weaponSplId: mainWeaponId,
  });

  const damageType = validatedDamageTypeFromSearchParams({
    searchParams,
    analyzed,
  });

  const handleChange = ({
    newMainWeaponId = mainWeaponId,
    newAbilityPoints = abilityPoints,
    newDamageType = damageType,
  }: {
    newMainWeaponId?: MainWeaponId;
    newAbilityPoints?: number;
    newDamageType?: DamageType;
  }) => {
    setSearchParams(
      {
        weapon: String(newMainWeaponId),
        [ABILITY_POINTS_SP_KEY]: String(newAbilityPoints),
        [DAMAGE_TYPE_SP_KEY]: newDamageType ?? "",
      },
      { replace: true, state: { scroll: false } }
    );
  };

  return {
    mainWeaponId,
    subWeaponId: analyzed.weapon.subWeaponSplId,
    handleChange,
    damagesToReceivers: damageType
      ? calculateDamage({
          abilityPoints: new Map([
            ["BRU", { ap: abilityPoints, apBeforeTacticooler: abilityPoints }],
            ["SPU", { ap: abilityPoints, apBeforeTacticooler: abilityPoints }],
          ]),
          analyzed,
          mainWeaponId,
          damageType,
        })
      : null,
    abilityPoints: String(abilityPoints),
    damageType,
    allDamageTypes: Array.from(
      new Set(analyzed.stats.damages.map((d) => d.type))
    ),
  };
}

function validatedAbilityPointsFromSearchParams(searchParams: URLSearchParams) {
  const abilityPoints = Number(searchParams.get(ABILITY_POINTS_SP_KEY));

  return (
    possibleApValues().find((possibleAp) => possibleAp === abilityPoints) ?? 0
  );
}

export const damageTypePriorityList: Array<DamageType> = [
  "DIRECT_MAX",
  "DIRECT",
  "DIRECT_MIN",
  "FULL_CHARGE",
  "MAX_CHARGE",
  "NORMAL_MAX_FULL_CHARGE",
  "NORMAL_MIN",
  "SPLASH",
  "TAP_SHOT",
  "DISTANCE",
  "BOMB_DIRECT",
  "BOMB_NORMAL",
];
function validatedDamageTypeFromSearchParams({
  searchParams,
  analyzed,
}: {
  searchParams: URLSearchParams;
  analyzed: AnalyzedBuild;
}) {
  const damageType = searchParams.get(DAMAGE_TYPE_SP_KEY);

  const found = analyzed.stats.damages.find((d) => d.type === damageType);

  if (found) return found.type;

  const fallbackFound = damageTypePriorityList.find((type) =>
    analyzed.stats.damages.some((d) => d.type === type)
  );

  return fallbackFound;
}
