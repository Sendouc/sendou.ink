/* eslint-disable */
// @ts-nocheck

// To run this script you need from https://github.com/Leanny/leanny.github.io
// 1) WeaponInfoMain.json inside dicts
// 2) WeaponInfoSub.json inside dicts
// 3) WeaponInfoSpecial.json inside dicts
// 4) SplPlayer.game__GameParameterTable.json inside dicts
// 5) params (weapon folder) inside dicts

import { type SpecialWeaponId, SQUID_BEAKON_ID } from "~/modules/in-game-lists";
import { type SubWeaponId, subWeaponIds } from "~/modules/in-game-lists";
import weapons from "./dicts/WeaponInfoMain.json";
import subWeapons from "./dicts/WeaponInfoSub.json";
import specialWeapons from "./dicts/WeaponInfoSpecial.json";
import playersParams from "./dicts/SplPlayer.game__GameParameterTable.json";
import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";
import type { MainWeaponParams, SubWeaponParams } from "~/modules/analyzer";
import type { ParamsJson } from "~/modules/analyzer/types";
import { z } from "zod";
import {
  LANG_JSONS_TO_CREATE,
  loadLangDicts,
  translationJsonFolderName,
} from "./utils";

const CURRENT_SEASON = 3;

type MainWeapon = (typeof weapons)[number];
type SubWeapon = (typeof subWeapons)[number];
type SpecialWeapon = (typeof specialWeapons)[number];
type TranslationArray = Array<{ language: string; key: string; value: string }>;

async function main() {
  const mainWeaponsResult: Record<number, MainWeaponParams> = {};
  const subWeaponsResult: Record<number, SubWeaponParams> = {};
  const specialWeaponsResult: any = {};
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
    const params = parametersToSubWeaponResult(subWeapon, rawParams);

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

    const rawParams = loadWeaponParamsObject(specialWeapon);
    const params = parametersToSpecialWeaponResult(rawParams);

    translationsToArray({
      arr: translations,
      internalName: specialWeapon.__RowId,
      weaponId: specialWeapon.Id,
      type: "Special",
      translations: langDicts,
    });

    specialWeaponsResult[specialWeapon.Id] = params;
  }

  const toFile: ParamsJson = {
    mainWeapons: mainWeaponsResult,
    subWeapons: subWeaponsResult,
    specialWeapons: specialWeaponsResult,
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

  // for blasters these values are the same and represent damage caused by direct
  const DamageParam_ValueDirect =
    params["DamageParam"]?.["ValueMax"] &&
    params["DamageParam"]?.["ValueMax"] === params["DamageParam"]?.["ValueMin"]
      ? params["DamageParam"]?.["ValueMax"]
      : undefined;

  const DamageParam_ValueMax = () => {
    if (DamageParam_ValueDirect) return undefined;

    return (
      params["DamageParam"]?.["ValueMax"] ??
      params["spl__BulletStringerParam"]?.["DamageParam"]?.[
        "DirectHitDamageMax"
      ] ??
      params["spl__BulletShelterShotgunParam"]?.["DamageEffectiveTotalMax"]
    );
  };

  const BlastParam_DistanceDamage = () => {
    // REEF-LUX has distance damage listed in params
    // but actually doesn't deal it in game
    if (weapon.Id === 7020) return undefined;

    return (
      params["BlastParam"]?.["DistanceDamage"] ??
      params["BlastParam"]?.["BlastParam"]?.["DistanceDamage"] ??
      params["spl__BulletStringerParam"]?.["DetonationParam"]?.["BlastParam"]?.[
        "DistanceDamage"
      ]
    );
  };

  const slosherDirectDamage = () => {
    const DamageParam_ValueDirectMax =
      params["UnitGroupParam"]?.["Unit"]?.[0]?.["DamageParam"]?.["ValueMax"];
    const DamageParam_ValueDirectMin =
      params["UnitGroupParam"]?.["Unit"]?.[0]?.["DamageParam"]?.["ValueMin"];

    if (
      DamageParam_ValueDirectMax &&
      DamageParam_ValueDirectMax === DamageParam_ValueDirectMin
    ) {
      return {
        DamageParam_ValueDirect: DamageParam_ValueDirectMax,
      };
    }

    return {
      DamageParam_ValueDirectMax,
      DamageParam_ValueDirectMin,
    };
  };

  const KeepChargeFullFrame =
    params["WeaponKeepChargeParam"]?.["KeepChargeFullFrame"] ??
    params["spl__WeaponStringerParam"]?.["ChargeKeepParam"]?.[
      "KeepChargeFullFrame"
    ];

  const isSloshingMachine = weapon.Id === 3020;

  const DamageParam_SplatanaHorizontalDirect =
    params["BulletSaberHorizontalParam"]?.["DamageParam"]?.["HitDamage"] +
    params["BulletSaberSlashHorizontalParam"]?.["DamageParam"]?.["DamageValue"];

  return {
    SpecialPoint: weapon.SpecialPoint,
    subWeaponId: resolveSubWeaponId(weapon),
    specialWeaponId: resolveSpecialWeaponId(weapon),
    overwrites: resolveOverwrites(params),
    TripleShotSpanFrame: params["WeaponParam"]?.["TripleShotSpanFrame"],
    WeaponSpeedType:
      params["MainWeaponSetting"]?.["WeaponSpeedType"] === "Mid"
        ? undefined
        : params["MainWeaponSetting"]?.["WeaponSpeedType"],
    MoveSpeed:
      params["WeaponParam"]?.["MoveSpeed"] ??
      params["spl__WeaponShelterShotgunParam"]?.["MoveSpeed"],
    MoveSpeed_Charge: params["WeaponParam"]?.["MoveSpeed_Charge"],
    MoveSpeedFullCharge:
      params["WeaponParam"]?.["MoveSpeedFullCharge"] ??
      params["spl__WeaponStringerParam"]?.["ChargeParam"]?.[
        "MoveSpeedFullCharge"
      ],
    DamageParam_ValueMax: DamageParam_ValueMax(),
    DamageParam_ValueMin: !DamageParam_ValueDirect
      ? params["DamageParam"]?.["ValueMin"] ??
        params["spl__BulletStringerParam"]?.["DamageParam"]?.[
          "DirectHitDamageMin"
        ]
      : undefined,
    DamageParam_ValueDirect,
    ...slosherDirectDamage(),
    BlastParam_SplashDamage: isSloshingMachine
      ? params["UnitGroupParam"]?.["Unit"]?.[1]?.["DamageParam"]?.["ValueMax"]
      : undefined,
    BlastParam_DistanceDamage: BlastParam_DistanceDamage(),
    DamageParam_ValueFullCharge: params["DamageParam"]?.["ValueFullCharge"],
    DamageParam_ValueFullChargeMax:
      params["DamageParam"]?.["ValueFullChargeMax"] !== DamageParam_ValueMax()
        ? params["DamageParam"]?.["ValueFullChargeMax"]
        : undefined,
    DamageParam_ValueMaxCharge: params["DamageParam"]?.["ValueMaxCharge"],
    DamageParam_ValueMinCharge: params["DamageParam"]?.["ValueMinCharge"],
    DamageParam_SplatanaVerticalDirect:
      params["BulletSaberSlashVerticalParam"]?.["DamageParam"]?.["DamageValue"],
    DamageParam_SplatanaVertical:
      params["BulletSaberVerticalParam"]?.["DamageParam"]?.["HitDamage"],
    DamageParam_SplatanaHorizontalDirect: Number.isNaN(
      DamageParam_SplatanaHorizontalDirect
    )
      ? undefined
      : DamageParam_SplatanaHorizontalDirect,
    DamageParam_SplatanaHorizontal:
      params["BulletSaberHorizontalParam"]?.["DamageParam"]?.["HitDamage"],
    CanopyHP: params["spl__BulletShelterCanopyParam"]?.["CanopyHP"],
    ChargeFrameFullCharge:
      params["WeaponParam"]?.["ChargeFrameFullCharge"] ??
      params["spl__WeaponStringerParam"]?.["ChargeParam"]?.[
        "ChargeFrameFullCharge"
      ],
    KeepChargeFullFrame:
      KeepChargeFullFrame !== 1 ? KeepChargeFullFrame : undefined,
    Jump_DegSwerve: params["WeaponParam"]?.["Jump_DegSwerve"],
    Stand_DegSwerve: params["WeaponParam"]?.["Stand_DegSwerve"],
    InkRecoverStop: params["WeaponParam"]?.["InkRecoverStop"],
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
      params["spl__WeaponShelterCanopyParam"]?.["InkConsumeUmbrella"] !== 0
        ? params["spl__WeaponShelterCanopyParam"]?.["InkConsumeUmbrella"]
        : undefined,
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

function parametersToSubWeaponResult(
  subWeapon: SubWeapon,
  params: any
): SubWeaponParams {
  const SubInkSaveLv = params["SubWeaponSetting"]?.["SubInkSaveLv"] ?? 2;

  return {
    overwrites: resolveSubWeaponOverwrites(subWeapon, params),
    SubInkSaveLv,
    InkConsume: params["WeaponParam"]["InkConsume"] ?? 0.7,
    InkRecoverStop: params["WeaponParam"]["InkRecoverStop"],
    DistanceDamage: params["BlastParamMaxCharge"]?.["DistanceDamage"]
      ? // curling bomb difference charge to same key
        [
          params["BlastParamMaxCharge"]["DistanceDamage"],
          params["BlastParamMinCharge"]?.["DistanceDamage"],
        ]
      : params["BlastParam"]?.["DistanceDamage"],
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

function parametersToSpecialWeaponResult(params: any) {
  const result: any = {};

  for (const parentValue of Object.values(params)) {
    for (const entries of Object.entries(parentValue as any)) {
      const [key, value]: any = entries;
      if (
        key === "SubSpecialSpecUpList" ||
        value.High !== value.Mid ||
        value.Mid !== value.Low
      ) {
        result[key] = value;
      }

      for (const innerEntries of Object.entries(value)) {
        const [innerMostKey, innerMostValue]: any = innerEntries;
        if (typeof innerMostValue !== "object") continue;
        if (
          innerMostKey === "SubSpecialSpecUpList" ||
          innerMostValue.High !== innerMostValue.Mid ||
          innerMostValue.Mid !== innerMostValue.Low
        ) {
          result[innerMostKey] = innerMostValue;
        }
      }
    }
  }

  const resultUnwrapped = unwrapSubSpecialSpecUpList(result);

  const specialDurationFrameKeyAlises = [
    "LaserFrame",
    "RainyFrame",
    "SpecialTotalFrame",
  ];

  for (const key of specialDurationFrameKeyAlises) {
    if (!resultUnwrapped[key]) continue;

    resultUnwrapped["SpecialDurationFrame"] = resultUnwrapped[key];
    resultUnwrapped[key] = undefined;
  }

  if (resultUnwrapped["SplashAroundPaintRadius"]) {
    resultUnwrapped["PaintRadius"] = resultUnwrapped["SplashAroundPaintRadius"];
    resultUnwrapped["SplashAroundPaintRadius"] = undefined;
  }

  return {
    ArmorHP: params["WeaponSpChariotParam"]?.["ArmorHP"],
    overwrites: resultUnwrapped,
  };
}

function unwrapSubSpecialSpecUpList(result: any) {
  return Object.fromEntries(
    Object.entries(result).flatMap((entries) => {
      const [key, value]: any = entries;
      if (Array.isArray(value)) {
        return value.map((v: any) => {
          if (
            !v.SpecUpType ||
            (v.Value.Low === v.Value.Mid && v.Value.Mid === v.Value.High)
          ) {
            return [];
          }

          return [v.SpecUpType, v.Value];
        });
      }

      return [[key, value]];
    })
  );
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

    resolveOverwritesWithArbitraryKeys(result, value);

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

function resolveOverwritesWithArbitraryKeys(
  result: NonNullable<MainWeaponParams["overwrites"]>,
  paramsObj: unknown
) {
  for (const [key, value] of Object.entries(
    paramsObj as Record<string, number>
  )) {
    if (!key.startsWith("Overwrite_")) continue;
    if (value === -1) continue;

    let abilityKey = key.replace("Overwrite_", "");

    for (const type of ["High", "Mid", "Low"] as const) {
      const suffix = `_${type}`;
      if (!abilityKey.endsWith(suffix)) continue;

      abilityKey = abilityKey.replace(suffix, "");

      if (!result[abilityKey]) result[abilityKey] = {};

      result[abilityKey]![type] = value;
    }
  }
}

function resolveSubWeaponOverwrites(subWeapon: SubWeapon, params: any) {
  const result: SubWeaponParams["overwrites"] = {
    SpawnSpeedZSpecUp: params["MoveParam"]?.["SpawnSpeedZSpecUp"],
    PeriodFirst: params["MoveParam"]?.["PeriodFirst"],
    PeriodSecond: params["MoveParam"]?.["PeriodSecond"],
    MarkingFrameSubSpec:
      params["MoveParam"]?.["MarkingFrameSubSpec"] ??
      params["MoveParam"]?.["MarkingFrame"] ??
      params["AreaParam"]?.["MarkingFrameSubSpec"],
    SensorRadius: params["MoveParam"]?.["SensorRadius"],
    ExplosionRadius: params["AreaParam"]?.["Distance"],
    MaxHP: params["MoveParam"]?.["MaxHP"],
    SubSpecUpParam: (subWeapon.Id === SQUID_BEAKON_ID
      ? {
          Low: 0.0,
          ...playersParams.GameParameters.spl__PlayerBeaconSubSpecUpParam
            .SubSpecUpParam,
        }
      : undefined) as any,
  };

  return Object.fromEntries(
    Object.entries(result).filter(
      ([_key, value]) =>
        value && (value.High !== value.Mid || value.Low !== value.High)
    )
  );
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

function loadWeaponParamsObject(
  weapon: MainWeapon | SubWeapon | SpecialWeapon
) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "dicts", "weapon", weaponRowIdToFileName(weapon)),
      "utf8"
    )
  )["GameParameters"];
}

function weaponRowIdToFileName(weapon: MainWeapon | SubWeapon | SpecialWeapon) {
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
        translationJsonFolderName(langCode),
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
