/* eslint-disable */
// @ts-nocheck

import path from "node:path";
import fs from "node:fs";
import type euEn from "./dicts/langs/EUen.json";

const LANG_DICTS_PATH = path.join(__dirname, "dicts", "langs");

export const LANG_JSONS_TO_CREATE = [
  "EUen",
  "CNzh",
  "EUde",
  "EUes",
  "USes",
  "EUfr",
  "EUit",
  "EUnl",
  "EUru",
  "JPja",
  "KRko",
];

export async function loadLangDicts() {
  const result: Array<[langCode: string, translations: typeof euEn]> = [];

  const files = await fs.promises.readdir(LANG_DICTS_PATH);
  for (const file of files) {
    if (file === ".gitkeep") continue;

    const translations = JSON.parse(
      fs.readFileSync(path.join(LANG_DICTS_PATH, file), "utf8"),
    );

    result.push([file.replace(".json", ""), translations]);
  }

  return result;
}

export function translationJsonFolderName(langCode: string) {
  if (langCode === "EUes") return "es-ES";
  if (langCode === "USes") return "es-US";
  return langCode.slice(2);
}
