import { suite } from "uvu";
import * as assert from "uvu/assert";
import { type MainWeaponId, mainWeaponIds } from "~/modules/in-game-lists";
import { damageTypeToWeaponType } from "../analyzer-constants";
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
      hasTacticooler: false,
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

AnalyzeBuild("Ninja Squid decreases swim speed", () => {
  const analyzed = buildStats({
    weaponSplId: 0,
    hasTacticooler: false,
  });

  const analyzedWithNS = buildStats({
    weaponSplId: 0,
    mainOnlyAbilities: ["NS"],
    hasTacticooler: false,
  });

  assert.ok(
    analyzed.stats.swimSpeed.value > analyzedWithNS.stats.swimSpeed.value
  );
});

AnalyzeBuild("Tacticooler / RP calculated correctly", () => {
  const fullQR = buildStats({
    weaponSplId: 0,
    abilityPoints: new Map([["QR", 57]]),
    hasTacticooler: false,
  });

  const tacticooler = buildStats({
    weaponSplId: 0,
    abilityPoints: new Map([["QR", 57]]),
    hasTacticooler: true,
  });

  assert.ok(
    fullQR.stats.quickRespawnTime.value ===
      tacticooler.stats.quickRespawnTime.value,
    "Base QR should be same whether 57AP of QR or Tacticooler"
  );
  assert.ok(
    fullQR.stats.quickRespawnTimeSplattedByRP.value >
      tacticooler.stats.quickRespawnTimeSplattedByRP.value,
    "Tacticooler splatted by RP should respawn faster than 57AP of QR"
  );
  assert.ok(
    tacticooler.stats.quickRespawnTime.value <
      tacticooler.stats.quickRespawnTimeSplattedByRP.value,
    "Tacticooler should respawn faster than Tacticooler splatted by RP"
  );
});

AnalyzeBuild(
  "Accounts for Jr. big ink tank with sub weapon ink consumption %",
  () => {
    const analyzedDualieSquelchers = buildStats({
      weaponSplId: 5030,
      hasTacticooler: false,
    });

    const analyzedJr = buildStats({
      weaponSplId: 10,
      hasTacticooler: false,
    });

    assert.ok(
      analyzedDualieSquelchers.stats.subWeaponInkConsumptionPercentage.value >
        analyzedJr.stats.subWeaponInkConsumptionPercentage.value
    );
  }
);

AnalyzeBuild.run();
