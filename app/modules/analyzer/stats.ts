import type {
  BuildAbilitiesTupleWithUnknown,
  MainWeaponId,
} from "~/modules/in-game-lists";
import type {
  AnalyzedBuild,
  DamageType,
  InkConsumeType,
  MainWeaponParams,
  StatFunctionInput,
  SubWeaponParams,
} from "./types";
import { DAMAGE_TYPE } from "./types";
import { INK_CONSUME_TYPES } from "./types";
import invariant from "tiny-invariant";
import {
  abilityPointsToEffects,
  apFromMap,
  buildToAbilityPoints,
  weaponParams,
} from "./utils";
import { assertUnreachable } from "~/utils/types";
import { semiRandomId } from "~/utils/strings";

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
      subWeaponSplId: mainWeaponParams.subWeaponId,
      specialWeaponSplId: mainWeaponParams.specialWeaponId,
      brellaCanopyHp: mainWeaponParams.CanopyHP,
      speedType: mainWeaponParams.WeaponSpeedType ?? "Normal",
      isTripleShooter: Boolean(mainWeaponParams.TripleShotSpanFrame),
    },
    stats: {
      specialPoint: specialPoint(input),
      specialSavedAfterDeath: specialSavedAfterDeath(input),
      fullInkTankOptions: fullInkTankOptions(input),
      damages: damages(input),
      subWeaponWhiteInkFrames: subWeaponParams.InkRecoverStop,
      squidFormInkRecoverySeconds: squidFormInkRecoverySeconds(input),
      runSpeed: runSpeed(input),
      // shootingRunSpeed: shootingRunSpeed(input),
      swimSpeed: swimSpeed(input),
    },
  };
}

function specialPoint({
  abilityPoints,
  mainWeaponParams,
}: StatFunctionInput): AnalyzedBuild["stats"]["specialPoint"] {
  const SPECIAL_POINT_ABILITY = "SCU";

  const { effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: abilityPoints,
      ability: SPECIAL_POINT_ABILITY,
    }),
    key: "IncreaseRt_Special",
    weapon: mainWeaponParams,
  });

  return {
    baseValue: mainWeaponParams.SpecialPoint,
    modifiedBy: SPECIAL_POINT_ABILITY,
    value: Math.ceil(mainWeaponParams.SpecialPoint / effect),
  };
}

function specialSavedAfterDeath({
  abilityPoints,
  mainWeaponParams,
}: StatFunctionInput): AnalyzedBuild["stats"]["specialPoint"] {
  const SPECIAL_SAVED_AFTER_DEATH_ABILITY = "SS";
  const specialSavedAfterDeathForDisplay = (effect: number) =>
    Number(((1.0 - effect) * 100).toFixed(2));

  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: abilityPoints,
      ability: SPECIAL_SAVED_AFTER_DEATH_ABILITY,
    }),
    key: "SpecialGaugeRt_Restart",
    weapon: mainWeaponParams,
  });

  return {
    baseValue: specialSavedAfterDeathForDisplay(baseEffect),
    value: specialSavedAfterDeathForDisplay(effect),
    modifiedBy: SPECIAL_SAVED_AFTER_DEATH_ABILITY,
  };
}

function fullInkTankOptions(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["fullInkTankOptions"] {
  const result: AnalyzedBuild["stats"]["fullInkTankOptions"] = [];

  const { inkConsume: subWeaponInkConsume, maxSubsFromFullInkTank } =
    subWeaponConsume(args);

  for (
    let subsFromFullInkTank = 0;
    subsFromFullInkTank <= maxSubsFromFullInkTank;
    subsFromFullInkTank++
  ) {
    for (const type of INK_CONSUME_TYPES) {
      const mainWeaponInkConsume = mainWeaponInkConsumeByType({
        type,
        ...args,
      });

      if (typeof mainWeaponInkConsume !== "number") continue;

      result.push({
        id: semiRandomId(),
        subsUsed: subsFromFullInkTank,
        type,
        value: effectToRounded(
          (1 - subWeaponInkConsume * subsFromFullInkTank) / mainWeaponInkConsume
        ),
      });
    }
  }

  return result;
}

function effectToRounded(effect: number) {
  return Number(effect.toFixed(2));
}

function subWeaponConsume({
  mainWeaponParams,
  subWeaponParams,
  abilityPoints,
}: StatFunctionInput) {
  const { effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints,
      ability: "ISS",
    }),
    // xxx: placeholder fallback before prod
    key: `ConsumeRt_Sub_Lv${subWeaponParams.SubInkSaveLv ?? 0}`,
    weapon: mainWeaponParams,
  });

  // xxx: placeholder fallback before prod
  const inkConsume = subWeaponParams.InkConsume ?? 0.6;

  const inkConsumeAfterISS = inkConsume * effect;

  return {
    inkConsume: inkConsumeAfterISS,
    maxSubsFromFullInkTank: Math.floor(1 / inkConsumeAfterISS),
  };
}

function mainWeaponInkConsumeByType({
  mainWeaponParams,
  abilityPoints,
  type,
}: {
  type: InkConsumeType;
} & StatFunctionInput) {
  const { effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints,
      ability: "ISM",
    }),
    key: "ConsumeRt_Main",
    weapon: mainWeaponParams,
  });

  // these keys are always mutually exclusive i.e. even if inkConsumeTypeToParamsKeys() returns many keys
  // then weapon params of this weapon should only have one defined
  for (const key of inkConsumeTypeToParamsKeys(type)) {
    const value = mainWeaponParams[key];

    if (typeof value === "number") {
      return value * effect;
    }
  }

  // not all weapons have all ink consume types
  // i.e. blaster does not (hopefully) perform dualie dodge rolls
  return;
}

function inkConsumeTypeToParamsKeys(
  type: InkConsumeType
): Array<keyof MainWeaponParams> {
  switch (type) {
    case "NORMAL":
      return ["InkConsume"];
    case "SWING":
      return ["InkConsume_SwingParam", "InkConsume_WeaponSwingParam"];
    case "SLOSH":
      return ["InkConsumeSlosher"];
    case "TAP_SHOT":
      return ["InkConsumeMinCharge"];
    case "FULL_CHARGE":
      return ["InkConsumeFullCharge", "InkConsumeFullCharge_ChargeParam"];
    case "SPLATLING_CHARGE":
      return ["InkConsumeFullChargeSplatling"];
    case "HORIZONTAL_SWING":
      return ["InkConsume_WeaponWideSwingParam"];
    case "VERTICAL_SWING":
      return ["InkConsume_WeaponVerticalSwingParam"];
    case "DUALIE_ROLL":
      return ["InkConsume_SideStepParam"];
    case "SHIELD_LAUNCH":
      return ["InkConsumeUmbrella_WeaponShelterCanopyParam"];
    default: {
      assertUnreachable(type);
    }
  }
}

const damageTypeToParamsKey: Record<
  DamageType,
  keyof MainWeaponParams | keyof SubWeaponParams
> = {
  NORMAL_MIN: "DamageParam_ValueMin",
  NORMAL_MAX: "DamageParam_ValueMax",
  DIRECT: "DamageParam_ValueDirect",
  DISTANCE: "BlastParam_DistanceDamage",
  FULL_CHARGE: "DamageParam_ValueFullCharge",
  MAX_CHARGE: "DamageParam_ValueMaxCharge",
  TAP_SHOT: "DamageParam_ValueMinCharge",
  BOMB_NORMAL: "DistanceDamage",
};

function damages(args: StatFunctionInput): AnalyzedBuild["stats"]["damages"] {
  const result: AnalyzedBuild["stats"]["damages"] = [];

  for (const type of DAMAGE_TYPE) {
    const key = damageTypeToParamsKey[type];
    const value =
      args.mainWeaponParams[key as keyof MainWeaponParams] ??
      args.subWeaponParams[key as keyof SubWeaponParams];

    if (Array.isArray(value)) {
      for (const subValue of value) {
        result.push({
          type,
          value: subValue.Damage / 10,
          distance: subValue.Distance,
          id: semiRandomId(),
        });
      }

      continue;
    }

    if (typeof value !== "number") continue;

    result.push({
      id: semiRandomId(),
      type,
      value: value / 10,
      shotsToSplat: shotsToSplat({
        value,
        type,
        isTripleShooter: Boolean(args.mainWeaponParams.TripleShotSpanFrame),
      }),
    });
  }

  return result;
}

function shotsToSplat({
  value,
  type,
  isTripleShooter,
}: {
  value: number;
  type: DamageType;
  isTripleShooter: boolean;
}) {
  if (type !== "NORMAL_MAX") return;

  const multiplier = isTripleShooter ? 3 : 1;

  return Math.ceil(1000 / (value * multiplier));
}

const framesToSeconds = (frames: number) =>
  effectToRounded(Math.ceil(frames) / 60);
function squidFormInkRecoverySeconds(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["squidFormInkRecoverySeconds"] {
  const SQUID_FORM_INK_RECOVERY_SECONDS_ABILITY = "IRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SQUID_FORM_INK_RECOVERY_SECONDS_ABILITY,
    }),
    key: "InkRecoverFrm_Stealth",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: framesToSeconds(baseEffect),
    value: framesToSeconds(effect),
    modifiedBy: SQUID_FORM_INK_RECOVERY_SECONDS_ABILITY,
  };
}

function runSpeed(args: StatFunctionInput): AnalyzedBuild["stats"]["runSpeed"] {
  const key =
    args.mainWeaponParams.WeaponSpeedType === "Fast"
      ? "_Fast"
      : args.mainWeaponParams.WeaponSpeedType === "Slow"
      ? "_Slow"
      : "";
  const RUN_SPEED_ABILITY = "RSU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: RUN_SPEED_ABILITY,
    }),
    key: `MoveVel_Human${key}`,
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: effectToRounded(baseEffect * 10),
    value: effectToRounded(effect * 10),
    modifiedBy: RUN_SPEED_ABILITY,
  };
}

function swimSpeed(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["swimSpeed"] {
  const key =
    args.mainWeaponParams.WeaponSpeedType === "Fast"
      ? "_Fast"
      : args.mainWeaponParams.WeaponSpeedType === "Slow"
      ? "_Slow"
      : "";
  const SWIM_SPEED_ABILITY = "SSU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SWIM_SPEED_ABILITY,
    }),
    key: `MoveVel_Stealth${key}`,
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: effectToRounded(baseEffect * 10),
    value: effectToRounded(effect * 10),
    modifiedBy: SWIM_SPEED_ABILITY,
  };
}
