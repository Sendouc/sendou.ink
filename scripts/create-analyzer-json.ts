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
import type { MainWeaponParams, SubWeaponParams } from "~/modules/analyzer";
import type { ParamsJson } from "~/modules/analyzer/types";

const CURRENT_SEASON = 0;

type MainWeapon = typeof weapons[number];
type SubWeapon = typeof subWeapons[number];

function main() {
  const mainWeaponsResult: Record<number, MainWeaponParams> = {};
  const subWeaponsResult: Record<number, SubWeaponParams> = {};

  for (const weapon of weapons) {
    if (mainWeaponShouldBeSkipped(weapon)) continue;

    const rawParams = loadWeaponParamsObject(weapon);
    const params = parametersToMainWeaponResult(weapon, rawParams);

    mainWeaponsResult[weapon.Id] = params;
  }

  for (const subWeapon of subWeapons) {
    if (subWeaponShouldBeSkipped(subWeapon)) continue;

    const rawParams = loadWeaponParamsObject(subWeapon);
    const params = parametersToSubWeaponResult(subWeapon, rawParams);

    subWeaponsResult[subWeapon.Id] = params;
  }

  const toFile: ParamsJson = {
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
