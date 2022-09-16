import { useSearchParams } from "@remix-run/react";
import * as React from "react";
import { EMPTY_BUILD } from "~/constants";
import {
  type BuildAbilitiesTupleWithUnknown,
  type MainWeaponId,
  mainWeaponIds,
  abilities,
  isAbility,
} from "../in-game-lists";
import type { AbilityType, AbilityWithUnknown } from "../in-game-lists/types";
import { MAX_LDE_INTENSITY } from "./constants";
import { applySpecialEffects, SPECIAL_EFFECTS } from "./specialEffects";
import { buildStats } from "./stats";
import type { SpecialEffectType } from "./types";
import { buildToAbilityPoints } from "./utils";

const UNKNOWN_SHORT = "U";

export function useAnalyzeBuild() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);
  const build = validatedBuildFromSearchParams(searchParams);
  const ldeIntensity = validatedLdeIntensityFromSearchParams(searchParams);
  const effects = validatedEffectsFromSearchParams({ searchParams, build });

  const handleChange = ({
    newMainWeaponId = mainWeaponId,
    newBuild = build,
    newLdeIntensity = ldeIntensity,
    newEffects = effects,
  }: {
    newMainWeaponId?: MainWeaponId;
    newBuild?: BuildAbilitiesTupleWithUnknown;
    newLdeIntensity?: number;
    newEffects?: Array<SpecialEffectType>;
  }) => {
    setSearchParams({
      weapon: String(newMainWeaponId),
      build: serializeBuild(newBuild),
      lde: String(newLdeIntensity),
      effect: newEffects,
    });
  };

  const abilityPoints = React.useMemo(() => {
    const buildsAbilityPoints = buildToAbilityPoints(build);

    return applySpecialEffects({
      abilityPoints: buildsAbilityPoints,
      effects,
      ldeIntensity,
    });
  }, [build, ldeIntensity, effects]);

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
    mainWeaponId,
    handleChange,
    analyzed,
    abilityPoints,
    ldeIntensity,
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

function validatedLdeIntensityFromSearchParams(searchParams: URLSearchParams) {
  const ldeIntensity = searchParams.get("lde")
    ? Number(searchParams.get("lde"))
    : null;

  if (
    !ldeIntensity ||
    !Number.isInteger(ldeIntensity) ||
    ldeIntensity < 0 ||
    ldeIntensity > MAX_LDE_INTENSITY
  ) {
    return 0;
  }

  return ldeIntensity;
}

function validatedEffectsFromSearchParams({
  searchParams,
  build,
}: {
  searchParams: URLSearchParams;
  build: BuildAbilitiesTupleWithUnknown;
}) {
  const result: Array<SpecialEffectType> = [];

  const effects = searchParams.getAll("effect");
  const effectsNoDuplicates = [...new Set(effects)];
  const abilities = build.flat();

  for (const effect of effectsNoDuplicates) {
    const effectObj = SPECIAL_EFFECTS.find((e) => e.type === effect);
    if (!effectObj) continue;

    // e.g. even if OG effect is active in state
    // it can't be on unless build has OG
    if (isAbility(effect) && !abilities.includes(effect)) {
      continue;
    }

    result.push(effect as SpecialEffectType);
  }

  // lde is a special case in that it's always
  // considered active when in the build
  if (abilities.includes("LDE") && !result.includes("LDE")) {
    result.push("LDE");
  }

  return result;
}
