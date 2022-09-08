import type {
  BuildAbilitiesTupleWithUnknown,
  MainWeaponId,
} from "~/modules/in-game-lists";
import type { AnalyzedBuild, StatFunctionInput } from "./types";
import invariant from "tiny-invariant";
import { buildToAbilityPoints, weaponParams } from "./utils";

export function buildStats({
  build,
  weaponSplId,
}: {
  build: BuildAbilitiesTupleWithUnknown;
  weaponSplId: MainWeaponId;
}): AnalyzedBuild {
  const mainWeaponParams = weaponParams().mainWeapons[weaponSplId];
  invariant(mainWeaponParams, `Weapon with splId ${weaponSplId} not found`);

  const subWeaponParams =
    weaponParams().subWeapons[mainWeaponParams.subWeaponId];
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
