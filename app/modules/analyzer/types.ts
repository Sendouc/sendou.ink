import type {
  Ability,
  MainWeaponId,
  SubWeaponId,
} from "~/modules/in-game-lists";

export interface MainWeaponParams {
  subWeaponId: SubWeaponId;
  specialWeaponId: number;
  internalName: string;
  /** Replacing default values of the ability json for this specific weapon */
  overwrites?: Record<string, Partial<Record<"High" | "Mid" | "Low", number>>>;
  SpecialPoint: number;
  /** How much ink one shot consumes? InkConsume = 0.5 means 2 shots per full tank */
  InkConsume?: number;
  /** How much ink one fully charged shot consumes? */
  InkConsumeFullCharge?: number;
  /** How much ink one tap shot consumes? */
  InkConsumeMinCharge?: number;
  // xxx: morph with another swing one below
  /** How much ink one swing of brush consumes? */
  InkConsume_WeaponSwingParam?: number;
  /** Lower bound of ink consumed per frame when rolling with roller/brush */
  InkConsumeMaxPerFrame_WeaponRollParam?: number;
  /** Upper bound of ink consumed per frame when rolling with roller/brush */
  InkConsumeMinPerFrame_WeaponRollParam?: number;
  /** How much ink one vertical swing of roller consumes? */
  InkConsume_WeaponVerticalSwingParam?: number;
  /** How much ink one horizontal swing of roller consumes? */
  InkConsume_WeaponWideSwingParam?: number;
  /** How much ink one swing of splatana consumes? */
  InkConsume_SwingParam?: number;
  /** How much ink brella shield launch consumes? */
  InkConsumeUmbrella_WeaponShelterCanopyParam?: number;
  // xxx: splat brella missing this - are we missing extend?
  /** How much ink one brella shot consumes? */
  InkConsume_WeaponShelterShotgunParam?: number;
  /** How much ink a dualie dodge roll consumes? */
  InkConsume_SideStepParam?: number;
  // xxx: some explanations... the below two are for splatana/bow
  InkConsumeFullCharge_ChargeParam?: number;
  InkConsumeMinCharge_ChargeParam?: number;
  //InkConsumeMidCharge_ChargeParam?: number;
  // xxx: what are these?
  // SpeedInkConsumeMax_WeaponRollParam?: number;
  // SpeedInkConsumeMin_WeaponRollParam?: number;
}

export interface DistanceDamage {
  damage: number;
  distance: number;
}

export interface SubWeaponParams {
  internalName: string;
  SubInkSaveLv: number;
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
  // xxx: verify torpedo
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
}

type InkConsumeShotType =
  | "NORMAL"
  | "SWING"
  | "VERTICAL_SWING"
  | "HORIZONTAL_SWING"
  | "TAP_SHOT"
  | "FULL_CHARGE";

type InkConsumePercentageType =
  | "SHIELD_LAUNCH"
  | "DUALIE_ROLL"
  | "ROLL_MIN"
  | "ROLL_MAX";

export interface AnalyzedBuild {
  weapon: {
    subWeaponSplId: number;
    specialWeaponSplId: number;
  };
  stats: {
    specialPoint: Stat;
    /** % of special charge saved when dying */
    specialSavedAfterDeath: Stat;
    shotsPerInkTank: Partial<Record<InkConsumeShotType, Stat>>;
    /** How much action costs (% of ink tank) */
    inkCost?: Partial<Record<InkConsumePercentageType, Stat>>;
    subWeaponWhiteInkFrames?: number;
  };
}
