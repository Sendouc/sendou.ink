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

const DIR_PATH_3 = path.join(
  __dirname,
  "..",
  "public",
  "static-assets",
  "img",
  "main-weapons-outlined-2"
);

async function main() {
  for (const [i, dir] of [DIR_PATH_1, DIR_PATH_2, DIR_PATH_3].entries()) {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      // skip if already replaced
      if (file.length <= 8) continue;

      const differentLevelBadge = (fileName: string) => {
        if (i === 1 && fileName.includes("Lv01")) return true;
        if (i === 2 && fileName.includes("Lv00")) return true;

        return false;
      };

      if (file.includes(".webp") || differentLevelBadge(file)) {
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
