// To run this script you need from https://github.com/Leanny/leanny.github.io
// 1) WeaponInfoMain.json inside dicts

import { weaponIds } from "~/modules/in-game-lists";
import weapons from "./dicts/WeaponInfoMain.json";
import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";

const CURRENT_SEASON = 0;

type Weapon = typeof weapons[number];

interface Params {
  id: number;
  internalName: string;
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

function main() {
  const result: Array<Params> = [];

  for (const weapon of weapons) {
    if (weaponShouldBeSkipped(weapon)) continue;

    const rawParams = loadWeaponParamsObject(weapon);
    const params = parametersToResult(weapon, rawParams);

    result.push(params);
  }

  fs.writeFileSync(
    path.join(__dirname, "output", `params.json`),
    JSON.stringify(result, null, 2) + "\n"
  );
}

function parametersToResult(weapon: Weapon, params: any): Params {
  return {
    id: weapon.Id,
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

function weaponShouldBeSkipped(weapon: Weapon) {
  if (!weaponIds.includes(weapon.Id as any)) return true;
  if (weapon.Season > CURRENT_SEASON) return true;

  return false;
}

function loadWeaponParamsObject(weapon: Weapon) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "dicts", "weapon", weaponRowIdToFileName(weapon)),
      "utf8"
    )
  )["GameParameters"];
}

function weaponRowIdToFileName(weapon: Weapon) {
  const [category, codeName] = weapon.__RowId.split("_");
  invariant(category);
  invariant(codeName);

  return `Weapon${category}${codeName}.game__GameParameterTable.json`;
}

main();
