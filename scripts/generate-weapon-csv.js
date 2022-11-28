/* eslint-disable */
// @ts-nocheck

// This script generates a CSV file for main weapons and some of their attributes.
// To run the script, run "node scripts/generate-weapon-csv.js" from the root of the repository folder

const weaponParams = require("../app/modules/analyzer/weapon-params.json");
const weaponsJsonEn = require("../public/locales/en/weapons.json");
const fs = require("fs");

const outFilePath = "output/main-weapon-table.csv";

function main() {
  // Create data structure where we can search by weaponId as the key
  const mainWeaponsJson = Object.keys(weaponsJsonEn)
    .filter((key) => key.includes("MAIN"))
    .reduce((obj, key) => {
      weaponId = key.replace("MAIN_", "");
      obj[weaponId] = weaponsJsonEn[key];
      return obj;
    }, {});
  const mainWeaponsParams = weaponParams.mainWeapons;

  const columnNames = [
    "Weapon Name",
    "Special Points Required",
    "Weapon Speed Type",
    "Move Speed",
  ];
  const columnNamesForCsv = columnNames.join(",") + "\r\n";
  fs.writeFileSync(outFilePath, columnNamesForCsv);

  const columnAttributes = ["SpecialPoint", "WeaponSpeedType", "MoveSpeed"];

  // Construct each row data string for each main weapon, then append them to the CSV file
  Object.entries(mainWeaponsParams).forEach((mainWeapon) => {
    const [weaponId, weaponAttributes] = mainWeapon;
    const weaponName = mainWeaponsJson[weaponId];

    let rowData = weaponName + ",";
    for (const attrKey of columnAttributes) {
      const attribute = weaponAttributes[attrKey] ?? "";
      rowData += attribute + ",";
    }

    rowData += "\r\n";
    fs.appendFileSync(outFilePath, rowData, (err) => {
      if (err) throw err;
    });
  });

  console.log(`Table was generated in file '${outFilePath}'`);
}

void main();
