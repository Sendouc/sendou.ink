/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import invariant from "tiny-invariant";

const WEAPON_IMAGES_PATH = path.join(
  __dirname,
  "..",
  "public",
  "img",
  "weapons"
);
const GEAR_IMAGES_DIR_PATH = path.join(
  __dirname,
  "..",
  "public",
  "img",
  "gear"
);
const WEAPONS_JSON_PATH = path.join(__dirname, "output", "weapons.json");
const GEAR_JSON_PATH = path.join(__dirname, "output", "gear.json");

async function main() {
  const weapons = JSON.parse(fs.readFileSync(WEAPONS_JSON_PATH, "utf8"));
  const files = await fs.promises.readdir(WEAPON_IMAGES_PATH);

  // weapons
  for (const file of files) {
    if (!file.startsWith("Path_Wst")) continue;

    const weaponInternalName = file
      .replace(".png", "")
      .replace("Path_Wst_", "");

    const weaponId = weapons.find(
      (w: any) => w.internalName === weaponInternalName
    ).id;
    invariant(typeof weaponId === "number", weaponInternalName + " has no id");

    fs.renameSync(
      path.join(WEAPON_IMAGES_PATH, file),
      path.join(WEAPON_IMAGES_PATH, `${weaponId}.png`)
    );
  }

  // gear
  const gear = JSON.parse(fs.readFileSync(GEAR_JSON_PATH, "utf8"));
  for (const gearSlot of ["head", "clothes", "shoes"] as const) {
    const gearSlotDirPath = path.join(GEAR_IMAGES_DIR_PATH, gearSlot);
    const files = await fs.promises.readdir(gearSlotDirPath);

    const type =
      gearSlot === "head" ? "Hed" : gearSlot === "shoes" ? "Shs" : "Clt";

    for (const file of files) {
      if (
        !file.startsWith("Shs") &&
        !file.startsWith("Clt") &&
        !file.startsWith("Hed")
      ) {
        continue;
      }

      const internalName = file.replace(".png", "").split("_")[1];
      invariant(internalName);

      const gearId = gear.find(
        (g: any) => g.internalName === internalName && g.type === type
      )?.id;
      invariant(typeof gearId === "number", internalName + " has no id");

      fs.renameSync(
        path.join(gearSlotDirPath, file),
        path.join(gearSlotDirPath, `${gearId}.png`)
      );
    }
  }

  console.log("done with all");
}

void main();
