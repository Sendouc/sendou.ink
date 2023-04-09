import type { AbilityType } from "~/modules/in-game-lists";
import {
  abilities,
  mainWeaponIds,
  weaponCategories,
  type Ability,
  type BuildAbilitiesTupleWithUnknown,
  type AbilityWithUnknown,
  type MainWeaponId,
} from "~/modules/in-game-lists";
import weaponParamsJson from "./weapon-params.json";
import abilityValuesJson from "./ability-values.json";
import type {
  AbilityPoints,
  AnalyzedBuild,
  MainWeaponParams,
  ParamsJson,
  SpecialWeaponParams,
  SubWeaponDamage,
  SubWeaponParams,
} from "../analyzer-types";
import invariant from "tiny-invariant";
import { EMPTY_BUILD } from "~/constants";
import { UNKNOWN_SHORT } from "../analyzer-constants";
import type { Unpacked } from "~/utils/types";

export function weaponParams(): ParamsJson {
  return weaponParamsJson as ParamsJson;
}

export function buildToAbilityPoints(build: BuildAbilitiesTupleWithUnknown) {
  const result: AbilityPoints = new Map();

  for (const abilityRow of build) {
    let abilityDoublerActive = false;
    for (const [i, ability] of abilityRow.entries()) {
      if (ability === "AD") {
        abilityDoublerActive = true;
      }
      if (!isStackableAbility(ability) && ability !== "UNKNOWN") {
        continue;
      }

      const aps = i === 0 ? 10 : 3;
      const apsDoubled = aps * (abilityDoublerActive ? 2 : 1);
      const newAp = (result.get(ability) ?? 0) + apsDoubled;

      result.set(ability, newAp);
    }
  }

  return result;
}

export function isStackableAbility(
  ability: AbilityWithUnknown
): ability is Ability {
  if (ability === "UNKNOWN") return false;
  const abilityObj = abilities.find((a) => a.name === ability);
  invariant(abilityObj);

  return abilityObj.type === "STACKABLE";
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

export function abilityValues({
  key,
  weapon,
}: {
  key: keyof typeof abilityValuesJson;
  weapon: MainWeaponParams | SubWeaponParams | SpecialWeaponParams;
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

function abilityPointsToEffect({
  key,
  abilityPoints,
  weapon,
}: {
  key: keyof typeof abilityValuesJson;
  abilityPoints: number;
  weapon: MainWeaponParams | SubWeaponParams | SpecialWeaponParams;
}) {
  const [high, mid, low] = abilityValues({ key, weapon });

  const slope = getSlope(high, mid, low);
  const percentage = calculateAbilityPointToPercent(abilityPoints) / 100.0;
  const result = low + (high - low) * lerpN(slope, percentage);

  return result;
}

export function abilityPointsToEffects({
  key,
  abilityPoints,
  weapon,
}: {
  key: keyof typeof abilityValuesJson;
  abilityPoints: number;
  weapon: MainWeaponParams | SubWeaponParams | SpecialWeaponParams;
}) {
  return {
    baseEffect: abilityPointsToEffect({ key, abilityPoints: 0, weapon }),
    effect: abilityPointsToEffect({ key, abilityPoints, weapon }),
  };
}

export function hasEffect({
  key,
  weapon,
}: {
  key: keyof typeof abilityValuesJson;
  weapon: MainWeaponParams | SubWeaponParams | SpecialWeaponParams;
}) {
  const [high, mid, low] = abilityValues({ key, weapon });

  return high !== mid || mid !== low;
}

export function validatedWeaponIdFromSearchParams(
  searchParams: URLSearchParams
): MainWeaponId {
  const weaponId = searchParams.get("weapon")
    ? Number(searchParams.get("weapon"))
    : null;

  if (mainWeaponIds.includes(weaponId as any)) {
    return weaponId as MainWeaponId;
  }

  return weaponCategories[0].weaponIds[0];
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

export function validatedBuildFromSearchParams(
  searchParams: URLSearchParams,
  key = "build",
  otherBuild?: BuildAbilitiesTupleWithUnknown
): BuildAbilitiesTupleWithUnknown {
  const abilitiesArr = searchParams.get(key)
    ? searchParams.get(key)?.split(",")
    : null;

  if (!abilitiesArr) return EMPTY_BUILD;
  if (otherBuild && buildIsEmpty(otherBuild)) return EMPTY_BUILD;

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

export function serializeBuild(build: BuildAbilitiesTupleWithUnknown) {
  return build
    .flat()
    .map((ability) => (ability === "UNKNOWN" ? UNKNOWN_SHORT : ability))
    .join(",");
}

export const hpDivided = (hp: number) => hp / 10;

export function possibleApValues() {
  const uniqueValues = new Set<number>();

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 10; j++) {
      uniqueValues.add(i * 10 + j * 3);
    }
  }

  return Array.from(uniqueValues).sort((a, b) => a - b);
}

export const buildIsEmpty = (build: BuildAbilitiesTupleWithUnknown) =>
  build.flat().every((ability) => ability === "UNKNOWN");

export function damageIsSubWeaponDamage(
  damage:
    | Unpacked<AnalyzedBuild["stats"]["damages"]>
    | Unpacked<AnalyzedBuild["stats"]["subWeaponDefenseDamages"]>
): damage is Unpacked<AnalyzedBuild["stats"]["subWeaponDefenseDamages"]> {
  return typeof (damage as SubWeaponDamage).subWeaponId === "number";
}
