import { useSearchParams } from "@remix-run/react";
import { EMPTY_BUILD } from "~/constants";
import {
  type BuildAbilitiesTupleWithUnknown,
  type MainWeaponId,
  type Ability,
  type AbilityType,
  type AbilityWithUnknown,
  abilities,
  isAbility,
} from "~/modules/in-game-lists";
import { MAX_LDE_INTENSITY } from "./analyzer-constants";
import { applySpecialEffects, SPECIAL_EFFECTS } from "./core/specialEffects";
import { buildStats } from "./core/stats";
import type { SpecialEffectType } from "./analyzer-types";
import {
  buildToAbilityPoints,
  validatedWeaponIdFromSearchParams,
} from "./core/utils";

const UNKNOWN_SHORT = "U";

export function useAnalyzeBuild() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);
  const build = validatedBuildFromSearchParams(searchParams);
  const build2 = validatedBuildFromSearchParams(searchParams, "build2");
  const ldeIntensity = validatedLdeIntensityFromSearchParams(searchParams);
  const effects = validatedEffectsFromSearchParams({ searchParams, build });
  const effects2 = validatedEffectsFromSearchParams({
    searchParams,
    build: build2,
  });
  const focused = validatedFocusedFromSearchParams({ searchParams });

  const handleChange = ({
    newMainWeaponId = mainWeaponId,
    newBuild = build,
    newBuild2 = build2,
    newLdeIntensity = ldeIntensity,
    newEffects = effects,
    newFocused = focused,
  }: {
    newMainWeaponId?: MainWeaponId;
    newBuild?: BuildAbilitiesTupleWithUnknown;
    newBuild2?: BuildAbilitiesTupleWithUnknown;
    newLdeIntensity?: number;
    newEffects?: Array<SpecialEffectType>;
    newFocused?: 1 | 2;
  }) => {
    setSearchParams(
      {
        weapon: String(newMainWeaponId),
        build: serializeBuild(newBuild),
        build2: serializeBuild(newBuild2),
        lde: String(newLdeIntensity),
        effect: newEffects,
        focused: String(newFocused),
      },
      { replace: true, state: { scroll: false } }
    );
  };

  const buildAbilityPoints = buildToAbilityPoints(build);
  const abilityPoints = applySpecialEffects({
    abilityPoints: buildAbilityPoints,
    effects,
    ldeIntensity,
  });
  const analyzed = buildStats({
    abilityPoints,
    weaponSplId: mainWeaponId,
    mainOnlyAbilities: build
      .map((row) => row[0])
      .filter(filterMainOnlyAbilities),
  });

  const buildAbilityPoints2 = buildToAbilityPoints(build2);
  const abilityPoints2 = applySpecialEffects({
    abilityPoints: buildAbilityPoints2,
    effects: effects2,
    ldeIntensity,
  });
  const analyzed2 = buildStats({
    abilityPoints: abilityPoints2,
    weaponSplId: mainWeaponId,
    mainOnlyAbilities: build2
      .map((row) => row[0])
      .filter(filterMainOnlyAbilities),
  });

  return {
    build,
    build2,
    focused,
    mainWeaponId,
    handleChange,
    analyzed,
    analyzed2,
    abilityPoints,
    effects,
    ldeIntensity,
  };
}

function filterMainOnlyAbilities(
  ability: AbilityWithUnknown
): ability is Ability {
  const abilityObj = abilities.find((a) => a.name === ability);
  return Boolean(abilityObj && abilityObj.type !== "STACKABLE");
}

function serializeBuild(build: BuildAbilitiesTupleWithUnknown) {
  return build
    .flat()
    .map((ability) => (ability === "UNKNOWN" ? UNKNOWN_SHORT : ability))
    .join(",");
}

function validatedBuildFromSearchParams(
  searchParams: URLSearchParams,
  key = "build"
): BuildAbilitiesTupleWithUnknown {
  const abilitiesArr = searchParams.get(key)
    ? searchParams.get(key)?.split(",")
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

function validatedFocusedFromSearchParams({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const focused = searchParams.get("focused");

  if (focused === "2") return 2;

  return 1;
}
