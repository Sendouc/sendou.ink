/* eslint-disable */
// @ts-nocheck

import {
  LANG_JSONS_TO_CREATE,
  loadLangDicts,
  translationJsonFolderName,
} from "./utils";
import fs from "fs";
import path from "path";
import invariant from "tiny-invariant";

// ⚠️ keep same order as https://github.com/IPLSplatoon/IPLMapGen2/blob/splat3/data.js
const stages = [
  "Scorch Gorge",
  "Eeltail Alley",
  "Hagglefish Market",
  "Undertow Spillway",
  "Mincemeat Metalworks",
  "Hammerhead Bridge",
  "Museum d'Alfonsino",
  "Mahi-Mahi Resort",
  "Inkblot Art Academy",
  "Sturgeon Shipyard",
  "MakoMart",
  "Wahoo World",
] as const;

async function main() {
  const langDicts = await loadLangDicts();

  const englishLangDict = langDicts.find(
    ([langCode]) => langCode === "EUen"
  )?.[1];
  invariant(englishLangDict);

  const codeNames = stages.map((stage) => {
    const codeName = Object.entries(
      englishLangDict["CommonMsg/VS/VSStageName"]
    ).find(([_key, value]) => value === stage)?.[0];

    invariant(codeName, `Could not find code name for stage ${stage}`);

    return codeName;
  });

  for (const langCode of LANG_JSONS_TO_CREATE) {
    const langDict = langDicts.find(([code]) => code === langCode)?.[1];
    invariant(langDict, `Missing translations for ${langCode}`);

    const translationsMap = Object.fromEntries(
      stages.map((_, i) => {
        const codeName = codeNames[
          i
        ] as keyof typeof langDict["CommonMsg/VS/VSStageName"];
        invariant(codeName);

        return [`STAGE_${i}`, langDict["CommonMsg/VS/VSStageName"][codeName]];
      })
    );

    fs.writeFileSync(
      path.join(
        __dirname,
        "..",
        "public",
        "locales",
        translationJsonFolderName(langCode),
        `game-misc.json`
      ),
      JSON.stringify(translationsMap, null, 2) + "\n"
    );
  }
}

void main();
