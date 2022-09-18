import type { Ability, MainWeaponId } from "~/modules/in-game-lists";
import { ANGLE_SHOOTER_ID } from "~/modules/in-game-lists";
import { INK_MINE_ID, POINT_SENSOR_ID } from "~/modules/in-game-lists";
import type {
  AbilityPoints,
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
  hasEffect,
  weaponParams,
} from "./utils";
import { assertUnreachable } from "~/utils/types";
import { semiRandomId } from "~/utils/strings";
import { roundToTwoDecimalPlaces } from "~/utils/number";

export function buildStats({
  abilityPoints,
  weaponSplId,
  mainOnlyAbilities,
}: {
  abilityPoints: AbilityPoints;
  weaponSplId: MainWeaponId;
  mainOnlyAbilities: Array<Ability>;
}): AnalyzedBuild {
  const mainWeaponParams = weaponParams().mainWeapons[weaponSplId];
  invariant(mainWeaponParams, `Weapon with splId ${weaponSplId} not found`);

  const subWeaponParams =
    weaponParams().subWeapons[mainWeaponParams.subWeaponId];
  invariant(
    subWeaponParams,
    `Sub weapon with splId ${mainWeaponParams.subWeaponId} not found`
  );

  const specialWeaponParams =
    weaponParams().specialWeapons[mainWeaponParams.specialWeaponId];
  invariant(
    specialWeaponParams,
    `Special weapon with splId ${mainWeaponParams.specialWeaponId} not found`
  );

  const input: StatFunctionInput = {
    mainWeaponParams,
    subWeaponParams,
    specialWeaponParams,
    abilityPoints,
    mainOnlyAbilities,
  };

  return {
    weapon: {
      subWeaponSplId: mainWeaponParams.subWeaponId,
      specialWeaponSplId: mainWeaponParams.specialWeaponId,
      brellaCanopyHp: mainWeaponParams.CanopyHP,
      fullChargeSeconds: mainWeaponParams.ChargeFrameFullCharge
        ? framesToSeconds(mainWeaponParams.ChargeFrameFullCharge)
        : undefined,
      maxChargeHoldSeconds: mainWeaponParams.KeepChargeFullFrame
        ? framesToSeconds(mainWeaponParams.KeepChargeFullFrame)
        : undefined,
      speedType: mainWeaponParams.WeaponSpeedType ?? "Normal",
      isTripleShooter: Boolean(mainWeaponParams.TripleShotSpanFrame),
    },
    stats: {
      specialPoint: specialPoint(input),
      specialSavedAfterDeath: specialSavedAfterDeath(input),
      fullInkTankOptions: fullInkTankOptions(input),
      damages: damages(input),
      mainWeaponWhiteInkSeconds:
        typeof mainWeaponParams.InkRecoverStop === "number"
          ? framesToSeconds(mainWeaponParams.InkRecoverStop)
          : undefined,
      subWeaponWhiteInkSeconds: framesToSeconds(subWeaponParams.InkRecoverStop),
      squidFormInkRecoverySeconds: squidFormInkRecoverySeconds(input),
      runSpeed: runSpeed(input),
      // shootingRunSpeed: shootingRunSpeed(input),
      swimSpeed: swimSpeed(input),
      runSpeedInEnemyInk: runSpeedInEnemyInk(input),
      damageTakenInEnemyInkPerSecond: damageTakenInEnemyInkPerSecond(input),
      enemyInkDamageLimit: enemyInkDamageLimit(input),
      framesBeforeTakingDamageInEnemyInk:
        framesBeforeTakingDamageInEnemyInk(input),
      quickRespawnTime: quickRespawnTime(input),
      superJumpTimeGroundFrames: superJumpTimeGroundFrames(input),
      superJumpTimeTotal: superJumpTimeTotal(input),
      shotSpreadAir: shotSpreadAir(input),
      shotSpreadGround: mainWeaponParams.Stand_DegSwerve,
      subDefPointSensorMarkedTimeInSeconds:
        subDefPointSensorMarkedTimeInSeconds(input),
      subDefInkMineMarkedTimeInSeconds: subDefInkMineMarkedTimeInSeconds(input),
      subDefAngleShooterMarkedTimeInSeconds:
        subDefAngleShooterMarkedTimeInSeconds(input),
      subDefToxicMistMovementReduction: subDefToxicMistMovementReduction(input),
      subDefAngleShooterDamage: subDefAngleShooterDamage(input),
      subDefSplashWallDamagePercentage: subDefSplashWallDamagePercentage(input),
      subDefSprinklerDamagePercentage: subDefSprinklerDamagePercentage(input),
      subDefBombDamageLightPercentage: subDefBombDamageLightPercentage(input),
      subDefBombDamageHeavyPercentage: subDefBombDamageHeavyPercentage(input),
      ...subStats(input),
      specialDurationInSeconds: specialDurationInSeconds(input),
      specialDamageDistance: specialDamageDistance(input),
      specialPaintRadius: specialPaintRadius(input),
      specialFieldHp: specialFieldHp(input),
      specialDeviceHp: specialDeviceHp(input),
      specialHookInkConsumptionPercentage:
        specialHookInkConsumptionPercentage(input),
      specialInkConsumptionPerSecondPercentage:
        specialInkConsumptionPerSecondPercentage(input),
      specialReticleRadius: specialReticleRadius(input),
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

const OWN_RESPAWN_PUNISHER_EXTRA_SPECIAL_LOST = 0.225;
function specialSavedAfterDeath({
  abilityPoints,
  mainWeaponParams,
  mainOnlyAbilities,
}: StatFunctionInput): AnalyzedBuild["stats"]["specialPoint"] {
  const SPECIAL_SAVED_AFTER_DEATH_ABILITY = "SS";
  const hasRespawnPunisher = mainOnlyAbilities.includes("RP");
  const extraSpecialLost = hasRespawnPunisher
    ? OWN_RESPAWN_PUNISHER_EXTRA_SPECIAL_LOST
    : 0;

  const specialSavedAfterDeathForDisplay = (effect: number) =>
    Number(((1.0 - effect) * 100).toFixed(2));

  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: abilityPoints,
      ability: SPECIAL_SAVED_AFTER_DEATH_ABILITY,
      key: hasRespawnPunisher ? "apBeforeTacticooler" : "ap",
    }),
    key: "SpecialGaugeRt_Restart",
    weapon: mainWeaponParams,
  });

  return {
    baseValue: specialSavedAfterDeathForDisplay(baseEffect),
    value: specialSavedAfterDeathForDisplay(effect - extraSpecialLost),
    modifiedBy: [SPECIAL_SAVED_AFTER_DEATH_ABILITY, "RP"],
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
      return ["InkConsume", "InkConsume_WeaponShelterShotgunParam"];
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
  BOMB_DIRECT: "DirectDamage",
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

function runSpeedInEnemyInk(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["runSpeedInEnemyInk"] {
  const RUN_SPEED_IN_ENEMY_INK_ABILITY = "RES";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: RUN_SPEED_IN_ENEMY_INK_ABILITY,
    }),
    key: "OpInk_MoveVel",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: effectToRounded(baseEffect * 10),
    value: effectToRounded(effect * 10),
    modifiedBy: RUN_SPEED_IN_ENEMY_INK_ABILITY,
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

  const ninjaSquidMultiplier = args.mainOnlyAbilities.includes("NS") ? 0.9 : 1;

  return {
    baseValue: effectToRounded(baseEffect * 10),
    value: effectToRounded(effect * 10 * ninjaSquidMultiplier),
    modifiedBy: [SWIM_SPEED_ABILITY, "NS"],
  };
}

const RESPAWN_CHASE_FRAME = 150;
const OWN_RESPAWN_PUNISHER_EXTRA_RESPAWN_FRAMES = 68;
function quickRespawnTime(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["quickRespawnTime"] {
  const QUICK_RESPAWN_TIME_ABILITY = "QR";
  const hasRespawnPunisher = args.mainOnlyAbilities.includes("RP");

  const chase = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: QUICK_RESPAWN_TIME_ABILITY,
      key: hasRespawnPunisher ? "apBeforeTacticooler" : "ap",
    }),
    key: "Dying_ChaseFrm",
    weapon: args.mainWeaponParams,
  });
  const around = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: QUICK_RESPAWN_TIME_ABILITY,
      key: hasRespawnPunisher ? "apBeforeTacticooler" : "ap",
    }),
    key: "Dying_AroundFrm",
    weapon: args.mainWeaponParams,
  });

  const extraFrames = hasRespawnPunisher
    ? OWN_RESPAWN_PUNISHER_EXTRA_RESPAWN_FRAMES
    : 0;

  return {
    baseValue: framesToSeconds(
      RESPAWN_CHASE_FRAME + chase.baseEffect + around.baseEffect
    ),
    value: framesToSeconds(
      RESPAWN_CHASE_FRAME + chase.effect + around.effect + extraFrames
    ),
    modifiedBy: [QUICK_RESPAWN_TIME_ABILITY, "RP"],
  };
}

function superJumpTimeGroundFrames(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["superJumpTimeGroundFrames"] {
  const SUPER_JUMP_TIME_GROUND_ABILITY = "QSJ";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUPER_JUMP_TIME_GROUND_ABILITY,
    }),
    key: "SuperJump_ChargeFrm",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: Math.ceil(baseEffect),
    value: Math.ceil(effect),
    modifiedBy: SUPER_JUMP_TIME_GROUND_ABILITY,
  };
}

function superJumpTimeTotal(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["superJumpTimeTotal"] {
  const SUPER_JUMP_TIME_TOTAL_ABILITY = "QSJ";

  const charge = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUPER_JUMP_TIME_TOTAL_ABILITY,
    }),
    key: "SuperJump_ChargeFrm",
    weapon: args.mainWeaponParams,
  });
  const move = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUPER_JUMP_TIME_TOTAL_ABILITY,
    }),
    key: "SuperJump_MoveFrm",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: framesToSeconds(
      Math.ceil(charge.baseEffect) + Math.ceil(move.baseEffect)
    ),
    value: framesToSeconds(Math.ceil(charge.effect) + Math.ceil(move.effect)),
    modifiedBy: SUPER_JUMP_TIME_TOTAL_ABILITY,
  };
}

function shotSpreadAir(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["shotSpreadAir"] {
  const SHOT_SPREAD_AIR_ABILITY = "IA";
  const groundSpread = args.mainWeaponParams.Stand_DegSwerve;
  const jumpSpread = args.mainWeaponParams.Jump_DegSwerve;

  if (
    typeof jumpSpread !== "number" ||
    typeof groundSpread !== "number" ||
    jumpSpread === groundSpread
  )
    return;

  const { effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SHOT_SPREAD_AIR_ABILITY,
    }),
    key: "ReduceJumpSwerveRate",
    weapon: args.mainWeaponParams,
  });

  const extraSpread = jumpSpread - groundSpread;
  const reducedExtraSpread = extraSpread * (1 - effect);

  return {
    baseValue: roundToTwoDecimalPlaces(jumpSpread),
    value: roundToTwoDecimalPlaces(reducedExtraSpread + groundSpread),
    modifiedBy: SHOT_SPREAD_AIR_ABILITY,
  };
}

function damageTakenInEnemyInkPerSecond(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["damageTakenInEnemyInkPerSecond"] {
  const DAMAGE_TAKEN_IN_ENEMY_INK_ABILITY = "RES";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: DAMAGE_TAKEN_IN_ENEMY_INK_ABILITY,
    }),
    key: "OpInk_DamagePerFrame",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: effectToDamage(baseEffect) * 60,
    value: effectToDamage(effect) * 60,
    modifiedBy: DAMAGE_TAKEN_IN_ENEMY_INK_ABILITY,
  };
}

function enemyInkDamageLimit(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["enemyInkDamageLimit"] {
  const ENEMY_INK_DAMAGE_LIMIT_ABILITY = "RES";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: ENEMY_INK_DAMAGE_LIMIT_ABILITY,
    }),
    key: "OpInk_DamageLmt",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: effectToDamage(baseEffect),
    value: effectToDamage(effect),
    modifiedBy: ENEMY_INK_DAMAGE_LIMIT_ABILITY,
  };
}

function effectToDamage(effect: number) {
  // not sure where the 0.05 is coming from. Old analyzer had it as well so assuming it's correct.
  return Number((effect * 100 - 0.05).toFixed(1));
}

function framesBeforeTakingDamageInEnemyInk(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["framesBeforeTakingDamageInEnemyInk"] {
  const FRAMES_BEFORE_TAKING_DAMAGE_IN_ENEMY_INK_ABILITY = "RES";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: FRAMES_BEFORE_TAKING_DAMAGE_IN_ENEMY_INK_ABILITY,
    }),
    key: "OpInk_ArmorHP",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: Math.ceil(baseEffect),
    value: Math.ceil(effect),
    modifiedBy: FRAMES_BEFORE_TAKING_DAMAGE_IN_ENEMY_INK_ABILITY,
  };
}

const SUB_WEAPON_STATS = [
  {
    analyzedBuildKey: "subVelocity",
    abilityValuesKey: "SpawnSpeedZSpecUp",
    type: "NO_CHANGE",
  },
  {
    analyzedBuildKey: "subFirstPhaseDuration",
    abilityValuesKey: "PeriodFirst",
    type: "TIME",
  },
  {
    analyzedBuildKey: "subSecondPhaseDuration",
    abilityValuesKey: "PeriodSecond",
    type: "TIME",
  },
  {
    analyzedBuildKey: "subMarkingTimeInSeconds",
    abilityValuesKey: "MarkingFrameSubSpec",
    type: "TIME",
  },
  {
    analyzedBuildKey: "subMarkingRadius",
    abilityValuesKey: "SensorRadius",
    type: "NO_CHANGE",
  },
  {
    analyzedBuildKey: "subExplosionRadius",
    abilityValuesKey: "ExplosionRadius",
    type: "NO_CHANGE",
  },
  { analyzedBuildKey: "subHp", abilityValuesKey: "MaxHP", type: "HP" },
] as const;
function subStats(args: StatFunctionInput) {
  const result: Partial<AnalyzedBuild["stats"]> = {};
  const SUB_STATS_KEY = "BRU";

  for (const { analyzedBuildKey, abilityValuesKey, type } of SUB_WEAPON_STATS) {
    if (!hasEffect({ key: abilityValuesKey, weapon: args.subWeaponParams })) {
      continue;
    }
    const { baseEffect, effect } = abilityPointsToEffects({
      abilityPoints: apFromMap({
        abilityPoints: args.abilityPoints,
        ability: SUB_STATS_KEY,
      }),
      key: abilityValuesKey,
      weapon: args.subWeaponParams,
    });

    const toValue = (effect: number) => {
      switch (type) {
        case "NO_CHANGE":
          return roundToTwoDecimalPlaces(effect);
        case "HP":
          return roundToTwoDecimalPlaces(effect / 10);
        case "TIME":
          return framesToSeconds(effect);
        default:
          assertUnreachable(type);
      }
    };

    result[analyzedBuildKey] = {
      baseValue: toValue(baseEffect),
      modifiedBy: SUB_STATS_KEY,
      value: toValue(effect),
    };
  }

  return result;
}

function subDefPointSensorMarkedTimeInSeconds(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefPointSensorMarkedTimeInSeconds"] {
  const SUB_DEF_POINT_SENSOR_MARKED_TIME_IN_SECONDS_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_POINT_SENSOR_MARKED_TIME_IN_SECONDS_KEY,
    }),
    key: "MarkingTimeRt",
    weapon: args.mainWeaponParams,
  });

  const pointSensorParams = weaponParams().subWeapons[POINT_SENSOR_ID];

  const { baseEffect: markingTimeEffect } = abilityPointsToEffects({
    abilityPoints: 0,
    key: "MarkingFrameSubSpec",
    weapon: pointSensorParams,
  });

  return {
    baseValue: framesToSeconds(markingTimeEffect * baseEffect),
    modifiedBy: SUB_DEF_POINT_SENSOR_MARKED_TIME_IN_SECONDS_KEY,
    value: framesToSeconds(markingTimeEffect * effect),
  };
}

function subDefInkMineMarkedTimeInSeconds(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefInkMineMarkedTimeInSeconds"] {
  const SUB_DEF_INK_MINE_MARKED_TIME_IN_SECONDS_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_INK_MINE_MARKED_TIME_IN_SECONDS_KEY,
    }),
    key: "MarkingTimeRt_Trap",
    weapon: args.mainWeaponParams,
  });

  const inkMineParams = weaponParams().subWeapons[INK_MINE_ID];

  const { baseEffect: markingTimeEffect } = abilityPointsToEffects({
    abilityPoints: 0,
    key: "MarkingFrameSubSpec",
    weapon: inkMineParams,
  });

  return {
    baseValue: framesToSeconds(markingTimeEffect * baseEffect),
    modifiedBy: SUB_DEF_INK_MINE_MARKED_TIME_IN_SECONDS_KEY,
    value: framesToSeconds(markingTimeEffect * effect),
  };
}

function subDefAngleShooterMarkedTimeInSeconds(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefAngleShooterMarkedTimeInSeconds"] {
  const SUB_DEF_ANGLE_SHOOTER_MARKED_TIME_IN_SECONDS_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_ANGLE_SHOOTER_MARKED_TIME_IN_SECONDS_KEY,
    }),
    key: "MarkingTimeRt",
    weapon: args.mainWeaponParams,
  });

  const angleShooterParams = weaponParams().subWeapons[ANGLE_SHOOTER_ID];

  const { baseEffect: markingTimeEffect } = abilityPointsToEffects({
    abilityPoints: 0,
    key: "MarkingFrameSubSpec",
    weapon: angleShooterParams,
  });

  return {
    baseValue: framesToSeconds(markingTimeEffect * baseEffect),
    modifiedBy: SUB_DEF_ANGLE_SHOOTER_MARKED_TIME_IN_SECONDS_KEY,
    value: framesToSeconds(markingTimeEffect * effect),
  };
}

function subDefToxicMistMovementReduction(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefToxicMistMovementReduction"] {
  const SUB_DEF_TOXIC_MIST_MOVEMENT_REDUCTION_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_TOXIC_MIST_MOVEMENT_REDUCTION_KEY,
    }),
    key: "MoveDownRt_PoisonMist",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SUB_DEF_TOXIC_MIST_MOVEMENT_REDUCTION_KEY,
  };
}

function subDefAngleShooterDamage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefAngleShooterDamage"] {
  const SUB_DEF_ANGLE_SHOOTER_DAMAGE_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_ANGLE_SHOOTER_DAMAGE_KEY,
    }),
    key: "DamageRt_LineMarker",
    weapon: args.mainWeaponParams,
  });

  const angleShooterDirectDamage =
    weaponParams().subWeapons[ANGLE_SHOOTER_ID].DirectDamage;
  invariant(angleShooterDirectDamage);

  return {
    baseValue: roundToTwoDecimalPlaces(
      (angleShooterDirectDamage * baseEffect) / 10
    ),
    value: roundToTwoDecimalPlaces((angleShooterDirectDamage * effect) / 10),
    modifiedBy: SUB_DEF_ANGLE_SHOOTER_DAMAGE_KEY,
  };
}

function subDefSplashWallDamagePercentage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefSplashWallDamagePercentage"] {
  const SUB_DEF_SPLASH_WALL_DAMAGE_PERCENTAGE_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_SPLASH_WALL_DAMAGE_PERCENTAGE_KEY,
    }),
    key: "DamageRt_Shield",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SUB_DEF_SPLASH_WALL_DAMAGE_PERCENTAGE_KEY,
  };
}

function subDefSprinklerDamagePercentage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefSprinklerDamagePercentage"] {
  const SUB_DEF_SPRINKLER_DAMAGE_PERCENTAGE_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_SPRINKLER_DAMAGE_PERCENTAGE_KEY,
    }),
    key: "DamageRt_Sprinkler",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SUB_DEF_SPRINKLER_DAMAGE_PERCENTAGE_KEY,
  };
}

function subDefBombDamageLightPercentage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefBombDamageLightPercentage"] {
  const SUB_DEF_BOMB_DAMAGE_LIGHT_PERCENTAGE_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_BOMB_DAMAGE_LIGHT_PERCENTAGE_KEY,
    }),
    key: "DamageRt_BombL",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SUB_DEF_BOMB_DAMAGE_LIGHT_PERCENTAGE_KEY,
  };
}

function subDefBombDamageHeavyPercentage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["subDefBombDamageHeavyPercentage"] {
  const SUB_DEF_BOMB_DAMAGE_HEAVY_PERCENTAGE_KEY = "SRU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SUB_DEF_BOMB_DAMAGE_HEAVY_PERCENTAGE_KEY,
    }),
    key: "DamageRt_BombH",
    weapon: args.mainWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SUB_DEF_BOMB_DAMAGE_HEAVY_PERCENTAGE_KEY,
  };
}

function specialDurationInSeconds(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialDurationInSeconds"] {
  if (
    !hasEffect({
      key: "SpecialDurationFrame",
      weapon: args.specialWeaponParams,
    })
  ) {
    return;
  }

  const SPECIAL_DURATION_IN_SECONDS_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_DURATION_IN_SECONDS_KEY,
    }),
    key: "SpecialDurationFrame",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: framesToSeconds(baseEffect),
    value: framesToSeconds(effect),
    modifiedBy: SPECIAL_DURATION_IN_SECONDS_KEY,
  };
}

function specialDamageDistance(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialDamageDistance"] {
  if (
    !hasEffect({
      key: "DistanceDamageDistanceRate",
      weapon: args.specialWeaponParams,
    })
  ) {
    return;
  }

  const SPECIAL_DAMAGE_DISTANCE_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_DAMAGE_DISTANCE_KEY,
    }),
    key: "DistanceDamageDistanceRate",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect),
    value: roundToTwoDecimalPlaces(effect),
    modifiedBy: SPECIAL_DAMAGE_DISTANCE_KEY,
  };
}

function specialPaintRadius(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialPaintRadius"] {
  if (!hasEffect({ key: "PaintRadius", weapon: args.specialWeaponParams })) {
    return;
  }

  const SPECIAL_PAINT_RADIUS_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_PAINT_RADIUS_KEY,
    }),
    key: "PaintRadius",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect),
    value: roundToTwoDecimalPlaces(effect),
    modifiedBy: SPECIAL_PAINT_RADIUS_KEY,
  };
}

function specialFieldHp(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialFieldHp"] {
  if (!hasEffect({ key: "MaxFieldHP", weapon: args.specialWeaponParams })) {
    return;
  }

  const SPECIAL_FIELD_HP_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_FIELD_HP_KEY,
    }),
    key: "MaxFieldHP",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect / 100),
    value: roundToTwoDecimalPlaces(effect / 100),
    modifiedBy: SPECIAL_FIELD_HP_KEY,
  };
}

function specialDeviceHp(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialDeviceHp"] {
  if (!hasEffect({ key: "MaxHP", weapon: args.specialWeaponParams })) {
    return;
  }

  const SPECIAL_DEVICE_HP_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_DEVICE_HP_KEY,
    }),
    key: "MaxHP",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect / 100),
    value: roundToTwoDecimalPlaces(effect / 100),
    modifiedBy: SPECIAL_DEVICE_HP_KEY,
  };
}

function specialHookInkConsumptionPercentage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialHookInkConsumptionPercentage"] {
  if (
    !hasEffect({
      key: "InkConsume_Hook",
      weapon: args.specialWeaponParams,
    })
  ) {
    return;
  }

  const SPECIAL_HOOK_INK_CONSUMPTION_PERCENTAGE_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_HOOK_INK_CONSUMPTION_PERCENTAGE_KEY,
    }),
    key: "InkConsume_Hook",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SPECIAL_HOOK_INK_CONSUMPTION_PERCENTAGE_KEY,
  };
}

function specialInkConsumptionPerSecondPercentage(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialInkConsumptionPerSecondPercentage"] {
  if (
    !hasEffect({
      key: "InkConsume_PerSec",
      weapon: args.specialWeaponParams,
    })
  ) {
    return;
  }

  const SPECIAL_INK_CONSUMPTION_PER_SECOND_PERCENTAGE_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_INK_CONSUMPTION_PER_SECOND_PERCENTAGE_KEY,
    }),
    key: "InkConsume_PerSec",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect * 100),
    value: roundToTwoDecimalPlaces(effect * 100),
    modifiedBy: SPECIAL_INK_CONSUMPTION_PER_SECOND_PERCENTAGE_KEY,
  };
}

function specialReticleRadius(
  args: StatFunctionInput
): AnalyzedBuild["stats"]["specialReticleRadius"] {
  if (
    !hasEffect({
      key: "TargetInCircleRadius",
      weapon: args.specialWeaponParams,
    })
  ) {
    return;
  }

  const SPECIAL_RETICLE_RADIUS_KEY = "SPU";
  const { baseEffect, effect } = abilityPointsToEffects({
    abilityPoints: apFromMap({
      abilityPoints: args.abilityPoints,
      ability: SPECIAL_RETICLE_RADIUS_KEY,
    }),
    key: "TargetInCircleRadius",
    weapon: args.specialWeaponParams,
  });

  return {
    baseValue: roundToTwoDecimalPlaces(baseEffect),
    value: roundToTwoDecimalPlaces(effect),
    modifiedBy: SPECIAL_RETICLE_RADIUS_KEY,
  };
}
