import weapons from "./dicts/WeaponInfoMain.json";
import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";

const INTERNAL_NAMES_TO_IGNORE: readonly string[] = ["Free"] as const;
const LANG_DICTS_PATH = path.join(__dirname, "dicts", "langs");
const OUTPUT_DIR_PATH = path.join(__dirname, "output");

async function loadLangDicts() {
  const result: Array<
    [langCode: string, translations: Record<string, string>]
  > = [];

  const files = await fs.promises.readdir(LANG_DICTS_PATH);
  for (const file of files) {
    if (file === ".gitkeep") continue;

    const translations = JSON.parse(
      fs.readFileSync(path.join(LANG_DICTS_PATH, file), "utf8")
    );

    result.push([file.replace(".json", ""), translations]);
  }

  return result;
}

async function main() {
  const result: Array<{
    id: number;
    internalName: string;
    translations: Array<{ language: string; name: string }>;
  }> = [];
  const langDicts = await loadLangDicts();

  for (const weapon of weapons) {
    if (
      weapon.Type === "Coop" ||
      INTERNAL_NAMES_TO_IGNORE.includes(weapon.__RowId)
    ) {
      continue;
    }

    result.push({
      id: weapon.Id,
      internalName: weapon.__RowId,
      translations: langDicts.map(([langCode, translations]) => {
        const name = translations[weapon.__RowId];
        invariant(name);

        return {
          language: langCode,
          name,
        };
      }),
    });
  }

  result.sort((a, b) => a.id - b.id);

  const weaponIds = result.map((w) => w.id);

  fs.writeFileSync(
    path.join(OUTPUT_DIR_PATH, "weapons.json"),
    JSON.stringify(result, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR_PATH, "weapon-ids.json"),
    JSON.stringify(weaponIds, null, 2)
  );
}

void main();
