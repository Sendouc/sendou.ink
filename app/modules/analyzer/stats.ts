import type { BuildAbilitiesTupleWithUnknown } from "~/modules/in-game-lists";
import type { BuildWeapon } from "~/db/types";
import type { AnalyzedBuild, StatFunctionInput } from "./types";
import invariant from "tiny-invariant";
import { buildToAbilityPoints, params } from "./utils";

export function buildStats({
  build,
  weaponSplId,
}: {
  build: BuildAbilitiesTupleWithUnknown;
  weaponSplId: BuildWeapon["weaponSplId"];
}): AnalyzedBuild {
  const mainWeaponParams = params().mainWeapons[weaponSplId];
  invariant(mainWeaponParams, `Weapon with splId ${weaponSplId} not found`);

  const subWeaponParams = params().subWeapons[mainWeaponParams.subWeaponId];
  invariant(
    subWeaponParams,
    `Sub weapon with splId ${mainWeaponParams.subWeaponId} not found`
  );

  const input: StatFunctionInput = {
    mainWeaponParams,
    subWeaponParams,
    abilityPoints: buildToAbilityPoints(build),
  };

  return {
    weapon: {
      specialWeaponSplId: mainWeaponParams.specialWeaponId,
      subWeaponSplId: mainWeaponParams.subWeaponId,
    },
    stats: {
      shotsPerInkTank: shotsPerInkTank(input),
      inkCost: inkCost(input),
      specialPoint: specialPoint(input),
      subWeaponWhiteInkFrames: subWeaponParams.InkRecoverStop,
    },
  };
}

function shotsPerInkTank(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["shotsPerInkTank"] {
  return {};
}

function specialPoint(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialPoint"] {
  return {
    baseValue: args.mainWeaponParams.SpecialPoint,
    modifiedBy: "SCU",
    value: args.mainWeaponParams.SpecialPoint, // xxx:
  };
}

function inkCost(args: StatFunctionInput): AnalyzedBuild["stats"]["inkCost"] {
  return {};
}
