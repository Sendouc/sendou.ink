import type { BuildAbilitiesTupleWithUnknown } from "../in-game-lists";
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

export function abilityValues({
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
