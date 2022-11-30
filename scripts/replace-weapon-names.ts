/* eslint-disable */
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";
import weapons from "./dicts/WeaponInfoMain.json";

const DIR_PATH_1 = path.join(
  __dirname,
  "..",
  "public",
  "static-assets",
  "img",
  "main-weapons"
);

const DIR_PATH_2 = path.join(
  __dirname,
  "..",
  "public",
  "static-assets",
  "img",
  "main-weapons-outlined"
);

async function main() {
  for (const dir of [DIR_PATH_1, DIR_PATH_2]) {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      // skip if already replaced
      if (file.length <= 8) continue;

      if (file.includes(".webp") || file.includes("Lv01")) {
        await fs.promises.unlink(path.join(dir, file));
        continue;
      }

      const weapon: any = weapons.find((weapon: any) =>
        file.includes(weapon.__RowId)
      );

      if (!weapon) {
        await fs.promises.unlink(path.join(dir, file));
        continue;
      }

      fs.renameSync(path.join(dir, file), path.join(dir, `${weapon.Id}.png`));
    }
  }

  console.log("done with all");
}

void main();
