import { useSearchParams } from "@remix-run/react";
import { assertType } from "~/utils/types";
import { type MainWeaponId } from "../in-game-lists";
import type { DAMAGE_TYPE } from "./constants";
import { calculateDamage } from "./objectDamage";
import { buildStats } from "./stats";
import type { AnalyzedBuild, DamageType } from "./types";
import { possibleApValues, validatedWeaponIdFromSearchParams } from "./utils";

const ABILITY_POINTS_SP_KEY = "ap";
const DAMAGE_TYPE_SP_KEY = "dmg";
const MULTI_SHOT_SP_KEY = "multi";

export function useObjectDamage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);
  const abilityPoints = validatedAbilityPointsFromSearchParams(searchParams);
  const isMultiShot = validatedMultiShotFromSearchParams(searchParams);
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
    newIsMultiShot = isMultiShot,
  }: {
    newMainWeaponId?: MainWeaponId;
    newAbilityPoints?: number;
    newDamageType?: DamageType;
    newIsMultiShot?: boolean;
  }) => {
    setSearchParams(
      {
        weapon: String(newMainWeaponId),
        [ABILITY_POINTS_SP_KEY]: String(newAbilityPoints),
        [DAMAGE_TYPE_SP_KEY]: newDamageType ?? "",
        [MULTI_SHOT_SP_KEY]: String(newIsMultiShot),
      },
      { replace: true, state: { scroll: false } }
    );
  };

  return {
    mainWeaponId,
    subWeaponId: analyzed.weapon.subWeaponSplId,
    isMultiShot,
    multiShotCount: analyzed.stats.damages.find((d) => d.type === damageType)
      ?.multiShots,
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
          isMultiShot,
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

function validatedMultiShotFromSearchParams(searchParams: URLSearchParams) {
  return searchParams.get(MULTI_SHOT_SP_KEY) === "false" ? false : true;
}

export const damageTypePriorityList = [
  "DIRECT_MAX",
  "DIRECT",
  "DIRECT_MIN",
  "FULL_CHARGE",
  "MAX_CHARGE",
  "NORMAL_MAX_FULL_CHARGE",
  "NORMAL_MAX",
  "NORMAL_MIN",
  "SPLASH",
  "TAP_SHOT",
  "DISTANCE",
  "BOMB_DIRECT",
  "BOMB_NORMAL",
  "SPLATANA_VERTICAL_DIRECT",
  "SPLATANA_VERTICAL",
  "SPLATANA_HORIZONTAL_DIRECT",
  "SPLATANA_HORIZONTAL",
] as const;
assertType<typeof damageTypePriorityList[number], typeof DAMAGE_TYPE[number]>();

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
