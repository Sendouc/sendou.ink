import type {
  Ability,
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
} from "~/modules/in-game-lists";
import type { SPECIAL_EFFECTS } from "./specialEffects";
import type abilityValues from "./ability-values.json";

export interface MainWeaponParams {
  subWeaponId: SubWeaponId;
  specialWeaponId: SpecialWeaponId;
  /** Replacing default values of the ability json for this specific weapon */
  overwrites?: Record<string, Partial<Record<"High" | "Mid" | "Low", number>>>;
  SpecialPoint: number;
  /** Weapon's weight class. "Light/Heavy weapon" */
  WeaponSpeedType?: "Slow" | "Fast";
  /** Total frames it takes the weapon to shoot out three times */
  TripleShotSpanFrame?: number;
  /** Amount of frames charge can be held */
  KeepChargeFullFrame?: number;
  /** Amount of frames full charge takes */
  ChargeFrameFullCharge?: number;
  DamageParam_ValueMax?: number;
  DamageParam_ValueMin?: number;
  DamageParam_ValueDirect?: number;
  /** Damage caused by charger's full charged shot */
  DamageParam_ValueFullCharge?: number;
  /** Max damage caused by charger's charged shot before fully charged */
  DamageParam_ValueMaxCharge?: number;
  /** Charger tap shot damage */
  DamageParam_ValueMinCharge?: number;
  BlastParam_DistanceDamage?: Array<DistanceDamage>;
  // DamageParam_ReduceStartFrame?: number;
  // DamageParam_ReduceEndFrame?: number;
  /** Brella shield HP */
  CanopyHP?: number;
  /** Amount of frames white ink (=no ink recovery during this time) takes */
  InkRecoverStop?: number;
  /** How much ink one shot consumes? InkConsume = 0.5 means 2 shots per full tank */
  InkConsume?: number;
  /** How much ink one slosh of slosher consumes? */
  InkConsumeSlosher?: number;
  /** How much ink one fully charged shot consumes? */
  InkConsumeFullCharge?: number;
  /** How much ink one tap shot consumes? */
  InkConsumeMinCharge?: number;
  /** How much ink one full charge of splatling consumes? */
  InkConsumeFullChargeSplatling?: number;
  /** How much ink one swing of brush consumes? */
  InkConsume_WeaponSwingParam?: number;
  /** How much ink one vertical swing of roller consumes? */
  InkConsume_WeaponVerticalSwingParam?: number;
  /** How much ink one horizontal swing of roller consumes? */
  InkConsume_WeaponWideSwingParam?: number;
  /** How much ink one swing of splatana consumes? */
  InkConsume_SwingParam?: number;
  /** How much ink brella shield launch consumes? */
  InkConsumeUmbrella_WeaponShelterCanopyParam?: number;
  /** How much ink one brella shot consumes? */
  InkConsume_WeaponShelterShotgunParam?: number;
  /** How much ink a dualie dodge roll consumes? */
  InkConsume_SideStepParam?: number;
  /** How much ink a fully charger Splatana shot consumes? */
  InkConsumeFullCharge_ChargeParam?: number;
  //InkConsumeMidCharge_ChargeParam?: number;
  // SpeedInkConsumeMax_WeaponRollParam?: number;
  // SpeedInkConsumeMin_WeaponRollParam?: number;
}

export interface DistanceDamage {
  Damage: number;
  Distance: number;
}

export interface SubWeaponParams {
  overwrites?: Record<string, Partial<Record<"High" | "Mid" | "Low", number>>>;
  SubInkSaveLv: 0 | 1 | 2 | 3;
  /** How much ink one usage of the sub consumes */
  InkConsume: number;
  /** Amount of frames white ink (=no ink recovery during this time) takes */
  InkRecoverStop: number;
  /** Damage dealt at different radiuses */
  DistanceDamage?: Array<DistanceDamage>;
  /** Damage dealt by explosion at different radiuses (curling bomb charged all the way) */
  DistanceDamage_BlastParamMaxCharge?: Array<DistanceDamage>;
  /** Damage dealt by explosion at different radiuses (curling bomb not charged) */
  DistanceDamage_BlastParamMinCharge?: Array<DistanceDamage>;
  /** Damage dealt by explosion at different radiuses (fizzy bomb bounces) */
  DistanceDamage_BlastParamArray?: Array<DistanceDamage>;
  /** Damage dealt by explosion at different radiuses (torpedo explosion air to ground) */
  DistanceDamage_BlastParamChase?: Array<DistanceDamage>;
  /** Damage dealt by explosion at different radiuses (rolling torpedo) */
  DistanceDamage_SplashBlastParam?: Array<DistanceDamage>;
  /** Damage dealt by direct hit */
  DirectDamage?: number;
}

export type ParamsJson = {
  mainWeapons: Record<MainWeaponId, MainWeaponParams>;
  subWeapons: Record<SubWeaponId, SubWeaponParams>;
};

export interface Stat {
  value: number;
  baseValue: number;
  modifiedBy: Ability;
}

export type AbilityPoints = Map<Ability, number>;

export interface StatFunctionInput {
  mainWeaponParams: MainWeaponParams;
  subWeaponParams: SubWeaponParams;
  abilityPoints: AbilityPoints;
  mainOnlyAbilities: Array<Ability>;
}

export type InkConsumeType = typeof INK_CONSUME_TYPES[number];

export const INK_CONSUME_TYPES = [
  "NORMAL",
  "SWING",
  "SLOSH",
  "VERTICAL_SWING",
  "HORIZONTAL_SWING",
  "TAP_SHOT",
  "FULL_CHARGE",
  "SPLATLING_CHARGE",
  "SHIELD_LAUNCH",
  "DUALIE_ROLL",
] as const;

export interface FullInkTankOption {
  subsUsed: number;
  value: number;
  type: InkConsumeType;
}

export const DAMAGE_TYPE = [
  "NORMAL_MIN",
  "NORMAL_MAX",
  "DIRECT",
  "FULL_CHARGE",
  "MAX_CHARGE",
  "TAP_SHOT",
  "DISTANCE",
  "BOMB_NORMAL",
  "BOMB_DIRECT",
] as const;

export type DamageType = typeof DAMAGE_TYPE[number];

export interface Damage {
  value: number;
  type: DamageType;
  distance?: number;
  shotsToSplat?: number;
}

export interface AnalyzedBuild {
  weapon: {
    subWeaponSplId: SubWeaponId;
    specialWeaponSplId: SpecialWeaponId;
    brellaCanopyHp?: number;
    maxChargeHoldSeconds?: number;
    fullChargeSeconds?: number;
    speedType: NonNullable<MainWeaponParams["WeaponSpeedType"]> | "Normal";
    isTripleShooter: boolean;
  };
  stats: {
    specialPoint: Stat;
    /** % of special charge saved when dying */
    specialSavedAfterDeath: Stat;
    mainWeaponWhiteInkSeconds?: number;
    subWeaponWhiteInkSeconds: number;
    fullInkTankOptions: Array<FullInkTankOption & { id: string }>;
    damages: Array<Damage & { id: string }>;
    squidFormInkRecoverySeconds: Stat;
    runSpeed: Stat;
    // shootingRunSpeed: Stat;
    swimSpeed: Stat;
    runSpeedInEnemyInk: Stat;
    framesBeforeTakingDamageInEnemyInk: Stat;
    damageTakenInEnemyInkPerSecond: Stat;
    enemyInkDamageLimit: Stat;
    quickRespawnTime: Stat;
    superJumpTimeGroundFrames: Stat;
    superJumpTimeTotal: Stat;

    subDefPointSensorMarkedTimeInSeconds: Stat;
    subDefInkMineMarkedTimeInSeconds: Stat;
    subDefAngleShooterMarkedTimeInSeconds: Stat;
    subDefToxicMistMovementReduction: Stat;
    subDefAngleShooterDamage: Stat;
    subDefSplashWallDamagePercentage: Stat;
    subDefSprinklerDamagePercentage: Stat;
    // subDefBombDamageLight: Stat;
    // subDefBombDamageHeavy: Stat;
    // subDefAngleShooterDamage: Stat;
    // subDefSplashWallDamage: Stat;
    // subDefSprinklerDamage: Stat;
    // subDefToxicMistMoveReduction: Stat;

    subVelocity?: Stat;
    subFirstPhaseDuration?: Stat;
    subSecondPhaseDuration?: Stat;
    subMarkingTimeInSeconds?: Stat;
    subMarkingRadius?: Stat;
    subExplosionRadius?: Stat;
    subHp?: Stat;
  };
}

export type SpecialEffectType = typeof SPECIAL_EFFECTS[number]["type"];

export type AbilityValuesKeys = keyof typeof abilityValues;
