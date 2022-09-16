import { useSearchParams } from "@remix-run/react";
import * as React from "react";
import { EMPTY_BUILD } from "~/constants";
import {
  type BuildAbilitiesTupleWithUnknown,
  type MainWeaponId,
  mainWeaponIds,
  abilities,
} from "../in-game-lists";
import type { AbilityType, AbilityWithUnknown } from "../in-game-lists/types";
import { buildStats } from "./stats";
import { buildToAbilityPoints } from "./utils";

const UNKNOWN_SHORT = "U";

export function useAnalyzeBuild() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);
  const build = validatedBuildFromSearchParams(searchParams);

  const setMainWeaponId = (weaponId: MainWeaponId) =>
    setSearchParams({ weapon: String(weaponId), build: serializeBuild(build) });
  const setBuild = (newBuild: BuildAbilitiesTupleWithUnknown) =>
    setSearchParams({
      build: serializeBuild(newBuild),
      weapon: String(mainWeaponId),
    });

  const abilityPoints = React.useMemo(
    () => buildToAbilityPoints(build),
    [build]
  );

  const analyzed = React.useMemo(
    () =>
      buildStats({
        abilityPoints,
        weaponSplId: mainWeaponId,
      }),
    [abilityPoints, mainWeaponId]
  );

  return {
    build,
    setBuild,
    mainWeaponId,
    setMainWeaponId,
    analyzed,
    abilityPoints,
  };
}

function serializeBuild(build: BuildAbilitiesTupleWithUnknown) {
  return build
    .flat()
    .map((ability) => (ability === "UNKNOWN" ? UNKNOWN_SHORT : ability))
    .join(",");
}

function validatedWeaponIdFromSearchParams(
  searchParams: URLSearchParams
): MainWeaponId {
  const weaponId = searchParams.get("weapon")
    ? Number(searchParams.get("weapon"))
    : null;

  if (mainWeaponIds.includes(weaponId as any)) {
    return weaponId as MainWeaponId;
  }

  return mainWeaponIds[0];
}

function validatedBuildFromSearchParams(
  searchParams: URLSearchParams
): BuildAbilitiesTupleWithUnknown {
  const abilitiesArr = searchParams.get("build")
    ? searchParams.get("build")?.split(",")
    : null;

  if (!abilitiesArr) return EMPTY_BUILD;

  try {
    return [
      [
        validateAbility(["STACKABLE", "HEAD_MAIN_ONLY"], abilitiesArr[0]),
        validateAbility(["STACKABLE"], abilitiesArr[1]),
        validateAbility(["STACKABLE"], abilitiesArr[2]),
        validateAbility(["STACKABLE"], abilitiesArr[3]),
      ],
      [
        validateAbility(["STACKABLE", "CLOTHES_MAIN_ONLY"], abilitiesArr[4]),
        validateAbility(["STACKABLE"], abilitiesArr[5]),
        validateAbility(["STACKABLE"], abilitiesArr[6]),
        validateAbility(["STACKABLE"], abilitiesArr[7]),
      ],
      [
        validateAbility(["STACKABLE", "SHOES_MAIN_ONLY"], abilitiesArr[8]),
        validateAbility(["STACKABLE"], abilitiesArr[9]),
        validateAbility(["STACKABLE"], abilitiesArr[10]),
        validateAbility(["STACKABLE"], abilitiesArr[11]),
      ],
    ];
  } catch (err) {
    return EMPTY_BUILD;
  }
}

function validateAbility(
  legalTypes: Array<AbilityType>,
  ability?: string
): AbilityWithUnknown {
  if (!ability) throw new Error("Ability missing");
  if (ability === UNKNOWN_SHORT) return "UNKNOWN";

  const abilityObj = abilities.find(
    (a) => a.name === ability && legalTypes.includes(a.type)
  );
  if (abilityObj) return abilityObj.name;

  throw new Error("Invalid ability");
}
