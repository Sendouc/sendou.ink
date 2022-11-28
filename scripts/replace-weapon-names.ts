/* eslint-disable */
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";

const DIR_PATH = path.join(
  __dirname,
  "..",
  "public",
  "img",
  "main-weapons-outlined"
);
const WEAPON_JSON_PATH = path.join(__dirname, "output", "weapons.json");

async function main() {
  const weapons = JSON.parse(fs.readFileSync(WEAPON_JSON_PATH, "utf8"));
  const files = await fs.promises.readdir(DIR_PATH);

  for (const file of files) {
    // did we already replace the name
    if (file.includes(".webp") || file.includes("Lv01")) {
      // delete file
      await fs.promises.unlink(path.join(DIR_PATH, file));
    }

    const weapon: any = weapons.find((weapon: any) =>
      file.includes(weapon.internalName)
    );
    invariant(weapon, `Could not find weapon for ${file}`);

    fs.renameSync(
      path.join(DIR_PATH, file),
      path.join(DIR_PATH, `${weapon.id}.png`)
    );
  }

  console.log("done with all");
}

void main();
