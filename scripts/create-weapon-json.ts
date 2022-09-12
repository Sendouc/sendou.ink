// To run this script you need from https://github.com/Leanny/leanny.github.io
// 1) WeaponInfoMain.json inside dicts
// 2) EUde.json, EUen.json... inside dicts/langs

import mainWeapons from "./dicts/WeaponInfoMain.json";
import fs from "node:fs";
import path from "node:path";

const INTERNAL_NAMES_TO_IGNORE: readonly string[] = ["Free"] as const;
const OUTPUT_DIR_PATH = path.join(__dirname, "output");

function main() {
  const result: Array<{
    id: number;
    internalName: string;
  }> = [];
  for (const weapon of mainWeapons) {
    if (
      weapon.Type === "Coop" ||
      INTERNAL_NAMES_TO_IGNORE.includes(weapon.__RowId)
    ) {
      continue;
    }

    result.push({
      id: weapon.Id,
      internalName: weapon.__RowId,
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

main();
