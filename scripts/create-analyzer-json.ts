// To run this script you need from https://github.com/Leanny/leanny.github.io
// 1) WeaponInfoMain.json inside dicts
// 2) WeaponInfoSub.json inside dicts
// 3) WeaponInfoSpecial.json inside dicts
// 4) params (weapon folder) inside dicts

import type { SpecialWeaponId } from "~/modules/in-game-lists";
import { type SubWeaponId, subWeaponIds } from "~/modules/in-game-lists";
import weapons from "./dicts/WeaponInfoMain.json";
// xxx: for example suction missing ink consume level, ink saver lvl... we are not considering default?
import subWeapons from "./dicts/WeaponInfoSub.json";
import specialWeapons from "./dicts/WeaponInfoSpecial.json";
import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";
import type { MainWeaponParams, SubWeaponParams } from "~/modules/analyzer";
import type { ParamsJson } from "~/modules/analyzer/types";
import { z } from "zod";
import { LANG_JSONS_TO_CREATE, loadLangDicts } from "./utils";

const CURRENT_SEASON = 1;

type MainWeapon = typeof weapons[number];
type SubWeapon = typeof subWeapons[number];
type SpecialWeapon = typeof specialWeapons[number];
type TranslationArray = Array<{ language: string; key: string; value: string }>;

async function main() {
  const mainWeaponsResult: Record<number, MainWeaponParams> = {};
  const subWeaponsResult: Record<number, SubWeaponParams> = {};
  const translations: TranslationArray = [];

  const langDicts = await loadLangDicts();

  for (const weapon of weapons) {
    if (mainWeaponShouldBeSkipped(weapon)) continue;

    const rawParams = loadWeaponParamsObject(weapon);
    const params = combineSwingsIfSame(
      parametersToMainWeaponResult(weapon, rawParams)
    );

    translationsToArray({
      arr: translations,
      internalName: weapon.__RowId,
      weaponId: weapon.Id,
      type: "Main",
      translations: langDicts,
    });

    mainWeaponsResult[weapon.Id] = params;
  }

  for (const subWeapon of subWeapons) {
    if (subWeaponShouldBeSkipped(subWeapon)) continue;

    const rawParams = loadWeaponParamsObject(subWeapon);
    const params = parametersToSubWeaponResult(rawParams);

    translationsToArray({
      arr: translations,
      internalName: subWeapon.__RowId,
      weaponId: subWeapon.Id,
      type: "Sub",
      translations: langDicts,
    });

    subWeaponsResult[subWeapon.Id] = params;
  }

  for (const specialWeapon of specialWeapons) {
    if (specialWeaponShouldBeSkipped(specialWeapon)) continue;

    translationsToArray({
      arr: translations,
      internalName: specialWeapon.__RowId,
      weaponId: specialWeapon.Id,
      type: "Special",
      translations: langDicts,
    });
  }

  const toFile: ParamsJson = {
    mainWeapons: mainWeaponsResult,
    subWeapons: subWeaponsResult,
  };

  fs.writeFileSync(
    path.join(__dirname, "output", `params.json`),
    JSON.stringify(toFile, null, 2) + "\n"
  );

  writeTranslationsJsons(translations);
  logWeaponIds(mainWeaponsResult);
}

function parametersToMainWeaponResult(
  weapon: MainWeapon,
  params: any
): MainWeaponParams {
  const isSplatling =
    params["WeaponParam"]?.["$type"] === "spl__WeaponSpinnerParam";
  const isSlosher =
    params["WeaponParam"]?.["$type"] === "spl__WeaponSlosherParam";

  const InkConsume =
    !isSplatling && !isSlosher
      ? params["WeaponParam"]?.["InkConsume"]
      : undefined;
  const InkConsumeFullChargeSplatling = isSplatling
    ? params["WeaponParam"]?.["InkConsume"]
    : undefined;

  const InkConsumeSlosher = isSlosher
    ? params["WeaponParam"]?.["InkConsume"]
    : undefined;

  return {
    SpecialPoint: weapon.SpecialPoint,
    subWeaponId: resolveSubWeaponId(weapon),
    specialWeaponId: resolveSpecialWeaponId(weapon),
    overwrites: resolveOverwrites(params),
    WeaponSpeedType: params["MainWeaponSetting"]?.["WeaponSpeedType"],
    InkConsume,
    InkConsumeSlosher,
    InkConsumeFullCharge: params["WeaponParam"]?.["InkConsumeFullCharge"],
    InkConsumeMinCharge: params["WeaponParam"]?.["InkConsumeMinCharge"],
    InkConsumeFullChargeSplatling,
    InkConsume_WeaponSwingParam: params["WeaponSwingParam"]?.["InkConsume"],
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
  };
}

function combineSwingsIfSame(params: MainWeaponParams): MainWeaponParams {
  if (
    !params.InkConsume_WeaponVerticalSwingParam ||
    params.InkConsume_WeaponVerticalSwingParam !==
      params.InkConsume_WeaponWideSwingParam
  ) {
    return params;
  }

  return {
    ...params,
    InkConsume_WeaponSwingParam: params.InkConsume_WeaponVerticalSwingParam,
    InkConsume_WeaponVerticalSwingParam: undefined,
    InkConsume_WeaponWideSwingParam: undefined,
  };
}

// const LEGAL_SUB_INK_SAVE_LV = [0, 1, 2, 3];
function parametersToSubWeaponResult(params: any): SubWeaponParams {
  const SubInkSaveLv = params["SubWeaponSetting"]?.["SubInkSaveLv"];
  // xxx: enable when all sub weapons have SubInkSaveLv's
  // invariant(
  //   LEGAL_SUB_INK_SAVE_LV.includes(SubInkSaveLv),
  //   `Unknown SubInkSaveLv ${SubInkSaveLv} for ${subWeapon.__RowId}`
  // );

  return {
    // xxx: not every sub has this, why? e.g. Splash Wall
    SubInkSaveLv,
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
  invariant(
    subWeaponIds.includes(subWeaponObj.Id as any),
    `Invalid sub weapon id`
  );

  return subWeaponObj.Id as SubWeaponId;
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

  return specialWeaponObj.Id as SpecialWeaponId;
}

const overwriteSchema = z.object({
  High: z.number().optional(),
  Mid: z.number().optional(),
  Low: z.number().optional(),
});

function resolveOverwrites(params: any) {
  const result: MainWeaponParams["overwrites"] = {};

  for (const [key, value] of Object.entries(params)) {
    const parsed = overwriteSchema.safeParse(value);

    // each object has a $type property which we ignore
    if (
      key.includes("PlayerGearSkillParam") &&
      parsed.success &&
      Object.keys(parsed).length > 1
    ) {
      const abilityKey = key.split("_").at(-1);
      invariant(abilityKey, `Could not find ability key for '${key}'`);

      if (!parsed.data.High && !parsed.data.Mid && !parsed.data.Low) {
        continue;
      }

      result[abilityKey] = {
        High: parsed.data.High,
        Mid: parsed.data.Mid,
        Low: parsed.data.Low,
      };
    }
  }

  if (Object.keys(result).length === 0) return;

  return result;
}

const WEAPON_TYPES_TO_IGNORE = [
  "Mission",
  "Coop",
  "Hero",
  "Rival",
  "SalmonBuddy",
];

const INTERNAL_WEAPON_NAMES_TO_IGNORE: readonly string[] = ["Free"] as const;
function mainWeaponShouldBeSkipped(mainWeapon: MainWeapon) {
  if (
    WEAPON_TYPES_TO_IGNORE.includes(mainWeapon.Type) ||
    INTERNAL_WEAPON_NAMES_TO_IGNORE.includes(mainWeapon.__RowId) ||
    mainWeapon.Season > CURRENT_SEASON
  ) {
    return true;
  }

  return false;
}

function subWeaponShouldBeSkipped(subWeapon: SubWeapon) {
  if (subWeapon.Id === 10000) return true;
  if (WEAPON_TYPES_TO_IGNORE.some((val) => subWeapon.__RowId.includes(val))) {
    return true;
  }

  return false;
}

function specialWeaponShouldBeSkipped(specialWeapon: SpecialWeapon) {
  if (WEAPON_TYPES_TO_IGNORE.some((val) => specialWeapon.Type.includes(val))) {
    return true;
  }
  if (specialWeapon.__RowId === "SpGachihoko") return true;

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

function translationsToArray({
  arr,
  internalName,
  weaponId,
  type,
  translations,
}: {
  arr: TranslationArray;
  internalName: string;
  weaponId: number;
  type: "Main" | "Sub" | "Special";
  translations: [
    langCode: string,
    translations: Record<string, Record<string, string>>
  ][];
}) {
  for (const langCode of LANG_JSONS_TO_CREATE) {
    const translationOfLanguage = translations.find((t) => t[0] === langCode);
    invariant(
      translationOfLanguage,
      `Could not find translation for '${langCode}'`
    );

    const value =
      translationOfLanguage[1][`CommonMsg/Weapon/WeaponName_${type}`]?.[
        internalName
      ];
    invariant(value, `Could not find translation for '${internalName}'`);

    arr.push({
      key: `${type.toUpperCase()}_${weaponId}`,
      language: langCode,
      value,
    });
  }
}

function writeTranslationsJsons(arr: TranslationArray) {
  for (const langCode of LANG_JSONS_TO_CREATE) {
    fs.writeFileSync(
      path.join(
        __dirname,
        "..",
        "public",
        "locales",
        langCode.slice(2),
        `weapons.json`
      ),
      JSON.stringify(
        Object.fromEntries(
          arr
            .filter((val) => val.language === langCode)
            .map(({ key, value }) => [key, value])
        ),
        null,
        2
      ) + "\n"
    );
  }
}

function logWeaponIds(weapons: Record<number, MainWeaponParams>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(Object.keys(weapons).map(Number)));
}

void main();
