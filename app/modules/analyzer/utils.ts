import type { Ability, BuildAbilitiesTupleWithUnknown } from "../in-game-lists";
import weaponParamsJson from "./weapon-params.json";
import abilityValuesJson from "./ability-values.json";
import type { AbilityPoints, MainWeaponParams, ParamsJson } from "./types";
import invariant from "tiny-invariant";

export function weaponParams(): ParamsJson {
  return weaponParamsJson as ParamsJson;
}

export function buildToAbilityPoints(build: BuildAbilitiesTupleWithUnknown) {
  const result: AbilityPoints = new Map();

  for (const abilityRow of build) {
    for (const [i, ability] of abilityRow.entries()) {
      if (ability === "UNKNOWN") continue;

      const aps = i === 0 ? 10 : 3;

      result.set(ability, (result.get(ability) ?? 0) + aps);
    }
  }

  return result;
}

export function apFromMap({
  abilityPoints,
  ability,
}: {
  abilityPoints: AbilityPoints;
  ability: Ability;
}) {
  return abilityPoints.get(ability) ?? 0;
}

function abilityValues({
  key,
  weapon,
}: {
  key: keyof typeof abilityValuesJson;
  weapon: MainWeaponParams;
}): [number, number, number] {
  const overwrites = weapon.overwrites?.[key];

  const [High, Mid, Low] = abilityValuesJson[key];
  invariant(typeof High === "number");
  invariant(typeof Mid === "number");
  invariant(typeof Low === "number");

  return [
    overwrites?.High ?? High,
    overwrites?.Mid ?? Mid,
    overwrites?.Low ?? Low,
  ];
}

function calculateAbilityPointToPercent(ap: number) {
  return Math.min(3.3 * ap - 0.027 * Math.pow(ap, 2), 100);
}

function getSlope(high: number, mid: number, low: number) {
  if (mid === low) {
    return 0;
  }
  return (mid - low) / (high - low);
}

function lerpN(p: number, s: number) {
  if (s.toFixed(3) === "0.500") {
    return p;
  }
  if (p === 0.0) {
    return p;
  }
  if (p === 1.0) {
    return p;
  }

  return Math.pow(Math.E, -1 * ((Math.log(p) * Math.log(s)) / Math.log(2)));
}

export function abilityPointsToEffect({
  key,
  abilityPoints,
  weapon,
}: {
  key: keyof typeof abilityValuesJson;
  abilityPoints: number;
  weapon: MainWeaponParams;
}) {
  const [high, mid, low] = abilityValues({ key, weapon });

  const slope = getSlope(high, mid, low);
  const percentage = calculateAbilityPointToPercent(abilityPoints) / 100.0;
  const result = low + (high - low) * lerpN(slope, percentage);

  // xxx: is this needed?
  //return [result, lerpN(slope, percentage) * 100];
  return result;
}
