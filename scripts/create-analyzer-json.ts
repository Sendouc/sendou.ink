// To run this script you need from https://github.com/Leanny/leanny.github.io
// 1) WeaponInfoMain.json inside dicts
// 2) WeaponInfoSub.json inside dicts
// 3) WeaponInfoMSpecial.json inside dicts

// xxx: internal name can be deleted when to prod

import { weaponIds } from "~/modules/in-game-lists";
import weapons from "./dicts/WeaponInfoMain.json";
import subWeapons from "./dicts/WeaponInfoSub.json";
import specialWeapons from "./dicts/WeaponInfoSpecial.json";
import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";

const CURRENT_SEASON = 0;

type MainWeapon = typeof weapons[number];
type SubWeapon = typeof subWeapons[number];

interface MainWeaponParams {
  id: number;
  subWeaponId: number;
  specialWeaponId: number;
  internalName: string;
  SpecialPoint: number;
  /** How much ink one shot consumes? InkConsume = 0.5 means 2 shots per full tank */
  InkConsume?: number;
  /** How much ink one fully charged shot consumes? */
  InkConsumeFullCharge?: number;
  /** How much ink one tap shot consumes? */
  InkConsumeMinCharge?: number;
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

interface DistanceDamage {
  damage: number;
  distance: number;
}

interface SubWeaponParams {
  id: number;
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

function main() {
  const mainWeaponsResult: Array<MainWeaponParams> = [];
  const subWeaponsResult: Array<SubWeaponParams> = [];

  for (const weapon of weapons) {
    if (mainWeaponShouldBeSkipped(weapon)) continue;

    const rawParams = loadWeaponParamsObject(weapon);
    const params = parametersToMainWeaponResult(weapon, rawParams);

    mainWeaponsResult.push(params);
  }

  for (const subWeapon of subWeapons) {
    if (subWeaponShouldBeSkipped(subWeapon)) continue;

    const rawParams = loadWeaponParamsObject(subWeapon);
    const params = parametersToSubWeaponResult(subWeapon, rawParams);

    subWeaponsResult.push(params);
  }

  const toFile = {
    mainWeapons: mainWeaponsResult,
    subWeapons: subWeaponsResult,
  };

  fs.writeFileSync(
    path.join(__dirname, "output", `params.json`),
    JSON.stringify(toFile, null, 2) + "\n"
  );
}

function parametersToMainWeaponResult(
  weapon: MainWeapon,
  params: any
): MainWeaponParams {
  return {
    id: weapon.Id,
    SpecialPoint: weapon.SpecialPoint,
    subWeaponId: resolveSubWeaponId(weapon),
    specialWeaponId: resolveSpecialWeaponId(weapon),
    internalName: weapon.__RowId.replace("_00", ""),
    InkConsume: params["WeaponParam"]?.["InkConsume"],
    InkConsumeFullCharge: params["WeaponParam"]?.["InkConsumeFullCharge"],
    InkConsumeMinCharge: params["WeaponParam"]?.["InkConsumeMinCharge"],
    InkConsume_WeaponSwingParam: params["WeaponSwingParam"]?.["InkConsume"],
    InkConsumeMaxPerFrame_WeaponRollParam:
      params["WeaponRollParam"]?.["InkConsumeMaxPerFrame"],
    InkConsumeMinPerFrame_WeaponRollParam:
      params["WeaponRollParam"]?.["InkConsumeMinPerFrame"],
    InkConsume_WeaponVerticalSwingParam:
      params["WeaponVerticalSwingParam"]?.["InkConsume"],
    InkConsume_WeaponWideSwingParam:
      params["WeaponWideSwingParam"]?.["InkConsume"],
    InkConsumeUmbrella_WeaponShelterCanopyParam:
      params["spl__WeaponShelterCanopyParam"]?.["InkConsumeUmbrella"],
    InkConsume_WeaponShelterShotgunParam:
      params["spl__WeaponShelterShotgunParam"]?.["InkConsume"],
    InkConsume_SideStepParam: params["SideStepParam"]?.["InkConsume"],
    InkConsume_SwingParam:
      params["spl__WeaponSaberParam"]?.["SwingParam"]?.["InkConsume"],
    InkConsumeFullCharge_ChargeParam:
      params["spl__WeaponSaberParam"]?.["ChargeParam"]?.[
        "InkConsumeFullCharge"
      ] ??
      params["spl__WeaponStringerParam"]?.["ChargeParam"]?.[
        "InkConsumeFullCharge"
      ],
    InkConsumeMinCharge_ChargeParam:
      params["spl__WeaponSaberParam"]?.["ChargeParam"]?.[
        "InkConsumeMinCharge"
      ] ??
      params["spl__WeaponStringerParam"]?.["ChargeParam"]?.[
        "InkConsumeMinCharge"
      ],
  };
}

function parametersToSubWeaponResult(
  subWeapon: SubWeapon,
  params: any
): SubWeaponParams {
  return {
    id: subWeapon.Id,
    internalName: subWeapon.__RowId,
    // xxx: not every sub has this, why? e.g. Splash Wall
    SubInkSaveLv: params["SubWeaponSetting"]?.["SubInkSaveLv"],
    InkConsume: params["WeaponParam"]["InkConsume"],
    InkRecoverStop: params["WeaponParam"]["InkRecoverStop"],
    DistanceDamage: params["BlastParam"]?.["DistanceDamage"],
    DistanceDamage_BlastParamMaxCharge:
      params["BlastParamMaxCharge"]?.["DistanceDamage"],
    DistanceDamage_BlastParamMinCharge:
      params["BlastParamMinCharge"]?.["DistanceDamage"],
    DirectDamage:
      params["MoveParam"]?.["DirectDamage"] ??
      params["MoveParam"]?.["DamageDirectHit"],
    DistanceDamage_BlastParamArray: params["MoveParam"]?.[
      "BlastParamArray"
    ]?.map((b: any) => b.DistanceDamage),
    DistanceDamage_BlastParamChase:
      params["BlastParamChase"]?.["DistanceDamage"],
    DistanceDamage_SplashBlastParam:
      params["BlastParamChase"]?.["SplashBlastParam"]?.["DistanceDamage"],
  };
}

function resolveSubWeaponId(weapon: MainWeapon) {
  const codeName = weapon.SubWeapon.replace("Work/Gyml/", "").replace(
    ".spl__WeaponInfoSub.gyml",
    ""
  );

  const subWeaponObj = subWeapons.find((wpn) => codeName === wpn.__RowId);
  invariant(subWeaponObj, `Could not find sub weapon for '${weapon.__RowId}'`);

  return subWeaponObj.Id;
}

function resolveSpecialWeaponId(weapon: MainWeapon) {
  const codeName = weapon.SpecialWeapon.replace("Work/Gyml/", "").replace(
    ".spl__WeaponInfoSpecial.gyml",
    ""
  );

  const specialWeaponObj = specialWeapons.find(
    (wpn) => codeName === wpn.__RowId
  );
  invariant(
    specialWeaponObj,
    `Could not find special weapon for '${codeName}'`
  );

  return specialWeaponObj.Id;
}

function mainWeaponShouldBeSkipped(weapon: MainWeapon) {
  if (!weaponIds.includes(weapon.Id as any)) return true;
  if (weapon.Season > CURRENT_SEASON) return true;

  return false;
}

function subWeaponShouldBeSkipped(subWeapon: SubWeapon) {
  if (subWeapon.Id === 10000) return true;

  return false;
}

function loadWeaponParamsObject(weapon: MainWeapon | SubWeapon) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "dicts", "weapon", weaponRowIdToFileName(weapon)),
      "utf8"
    )
  )["GameParameters"];
}

function weaponRowIdToFileName(weapon: MainWeapon | SubWeapon) {
  const [category, codeName] = weapon.__RowId.split("_");
  invariant(category);

  return `Weapon${category}${codeName ?? ""}.game__GameParameterTable.json`;
}

main();
