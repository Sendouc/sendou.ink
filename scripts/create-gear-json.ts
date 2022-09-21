/* eslint-disable */
// @ts-nocheck

import head from "./dicts/GearInfoHead.json";
import clothes from "./dicts/GearInfoClothes.json";
import shoes from "./dicts/GearInfoShoes.json";

import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";
import { LANG_JSONS_TO_CREATE, loadLangDicts } from "./utils";

const CURRENT_SEASON = 1;
const OUTPUT_DIR_PATH = path.join(__dirname, "output");

const LEAN_HEAD_CODE = "Hed";
const LEAN_CLOTHES_CODE = "Clt";
const LEAN_SHOES_CODE = "Shs";

const AVAILABLE_SR_GEAR = [21010];

async function main() {
  const allGear: Array<{
    id: number;
    internalName: string;
    type: string;
    translations: Array<{ language: string; name: string }>;
  }> = [];
  const langDicts = await loadLangDicts();

  for (const gear of [...head, ...clothes, ...shoes]) {
    if (gear.Season > CURRENT_SEASON || gear.HowToGet === "Impossible") {
      continue;
    }

    if (gear.__RowId.includes("COP") && !AVAILABLE_SR_GEAR.includes(gear.Id)) {
      continue;
    }

    const [type, internalName] = gear.__RowId.split("_");
    invariant(type);
    invariant(internalName);

    const categoryKey = `CommonMsg/Gear/GearName_${
      type === LEAN_CLOTHES_CODE
        ? "Clothes"
        : type === LEAN_SHOES_CODE
        ? "Shoes"
        : "Head"
    }`;

    allGear.push({
      id: gear.Id,
      type,
      internalName,
      translations: langDicts.map(([langCode, translations]) => {
        const name = translations[categoryKey]?.[internalName];
        invariant(name, `Missing translation for ${internalName}`);

        return {
          language: langCode,
          name,
        };
      }),
    });
  }

  allGear.sort((a, b) => a.id - b.id);

  fs.writeFileSync(
    path.join(OUTPUT_DIR_PATH, "gear.json"),
    JSON.stringify(allGear, null, 2)
  );

  const headGear = allGear.filter((g) => g.type === LEAN_HEAD_CODE);
  const clothesGear = allGear.filter((g) => g.type === LEAN_CLOTHES_CODE);
  const shoesGear = allGear.filter((g) => g.type === LEAN_SHOES_CODE);
  invariant(headGear.length);
  invariant(clothesGear.length);
  invariant(shoesGear.length);

  const headIds = headGear.map((w) => w.id);
  const clothesIds = clothesGear.map((w) => w.id);
  const shoesIds = shoesGear.map((w) => w.id);

  fs.writeFileSync(
    path.join(OUTPUT_DIR_PATH, "head-ids.json"),
    JSON.stringify(headIds, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR_PATH, "clothes-ids.json"),
    JSON.stringify(clothesIds, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR_PATH, "shoes-ids.json"),
    JSON.stringify(shoesIds, null, 2)
  );

  for (const langCode of LANG_JSONS_TO_CREATE) {
    const translationsMap = Object.fromEntries(
      allGear.map((gear) => {
        const translation = gear.translations.find(
          (t) => t.language === langCode
        )?.name;
        invariant(
          translation,
          `No translation for ${gear.internalName} in ${langCode}`
        );

        return [`${gear.type.charAt(0).toUpperCase()}_${gear.id}`, translation];
      })
    );

    fs.writeFileSync(
      path.join(
        __dirname,
        "..",
        "public",
        "locales",
        langCode.slice(2),
        `gear.json`
      ),
      JSON.stringify(translationsMap, null, 2) + "\n"
    );
  }
}

void main();
