import { suite } from "uvu";
import * as assert from "uvu/assert";
import { type MainWeaponId, mainWeaponIds } from "~/modules/in-game-lists";
import { damageTypeToWeaponType } from "./constants";
import { buildStats } from "./stats";

const AnalyzeBuild = suite("Analyze build");

// TODO: all weapons should have damage
const weaponsWithoutDmg: MainWeaponId[] = [
  1000, 1010, 1020, 1030, 1100, 1110, 7010, 7020, 8000, 8010,
  /* chill season, */ 1001, 1040, 1101,
];
AnalyzeBuild("Every main weapon has damage", () => {
  const weaponsWithoutDamage: MainWeaponId[] = [];

  for (const weaponSplId of mainWeaponIds) {
    const analyzed = buildStats({
      weaponSplId,
    });

    const hasDamage =
      analyzed.stats.damages.filter(
        (dmg) => damageTypeToWeaponType[dmg.type] === "MAIN"
      ).length > 0;

    if (!hasDamage && !weaponsWithoutDmg.includes(weaponSplId)) {
      weaponsWithoutDamage.push(weaponSplId);
    }
  }

  assert.ok(
    weaponsWithoutDamage.length === 0,
    `Weapons without damage set: ${weaponsWithoutDamage.join(", ")}`
  );
});

AnalyzeBuild.run();
