import type { BuildAbilitiesTupleWithUnknown } from "../in-game-lists";
import paramsJson from "./params.json";
import type { AbilityPoints, ParamsJson } from "./types";

export function params(): ParamsJson {
  return paramsJson as ParamsJson;
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
