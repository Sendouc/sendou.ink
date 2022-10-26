import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { MainWeaponId } from "../in-game-lists";
import { calculateDamage } from "./objectDamage";
import { buildStats } from "./stats";
import type { AbilityPoints, DamageType } from "./types";

function calculate({
  mainWeaponId = 10,
  abilityPoints = new Map(),
  damageType = "NORMAL_MAX",
}: {
  mainWeaponId?: MainWeaponId;
  abilityPoints?: AbilityPoints;
  damageType?: DamageType;
}) {
  const analyzed = buildStats({
    weaponSplId: mainWeaponId,
  });

  return calculateDamage({
    abilityPoints,
    analyzed,
    mainWeaponId,
    damageType,
  });
}

const CalculateDamage = suite("calculateDamage()");

CalculateDamage("BRU increases Splash Wall hitpoints", () => {
  const withoutBRU = calculate({});
  const withBRU = calculate({
    abilityPoints: new Map([["BRU", { ap: 10, apBeforeTacticooler: 10 }]]),
  });

  const hpWithoutBRU = withoutBRU.find(
    (d) => d.receiver === "Wsb_Shield"
  )?.hitPoints;
  const hpWithBRU = withBRU.find((d) => d.receiver === "Wsb_Shield")?.hitPoints;

  assert.ok(typeof hpWithoutBRU === "number");
  assert.ok(typeof hpWithBRU === "number");
  assert.ok(hpWithoutBRU < hpWithBRU);
});

CalculateDamage("SPU increases Big Bubbler hitpoints", () => {
  const withoutSPU = calculate({});
  const withSPU = calculate({
    abilityPoints: new Map([["SPU", { ap: 10, apBeforeTacticooler: 10 }]]),
  });

  const hpWithoutSPU = withoutSPU.find(
    (d) => d.receiver === "GreatBarrier_Barrier"
  )?.hitPoints;
  const hpWithSPU = withSPU.find(
    (d) => d.receiver === "GreatBarrier_Barrier"
  )?.hitPoints;

  assert.ok(typeof hpWithoutSPU === "number");
  assert.ok(typeof hpWithSPU === "number");
  assert.ok(hpWithoutSPU < hpWithSPU);
});

const shotsToPopRM: Array<
  [
    weaponId: MainWeaponId,
    damageType: DamageType,
    shotsToPop: number,
    shotsToPopOS: number
  ]
> = [
  // Splattershot
  [40, "NORMAL_MAX", 28, 26],
  // Range Blaster
  [220, "DIRECT", 5, 4],
  // .96 Gal
  [80, "NORMAL_MAX", 17, 15],
  // Splat Charger
  [2010, "FULL_CHARGE", 4, 3],
  // E-liter 4K
  [2030, "TAP_SHOT", 13, 12],
];

CalculateDamage(
  "Calculates matching HTD Rainmaker shield to in-game tests",
  () => {
    for (const [
      mainWeaponId,
      damageType,
      shotsToPop,
      shotsToPopOS,
    ] of shotsToPopRM) {
      const damages = calculate({ mainWeaponId, damageType });

      const damageVsRM = damages.find(
        (d) => d.receiver === "Gachihoko_Barrier"
      )!;

      assert.equal(
        damageVsRM.damages.find((d) => !d.objectShredder)!.hitsToDestroy,
        shotsToPop,
        `Shots to pop wrong for weapon id: ${mainWeaponId}`
      );
      assert.equal(
        damageVsRM.damages.find((d) => d.objectShredder)!.hitsToDestroy,
        shotsToPopOS,
        `Shots to pop wrong with OS for weapon id: ${mainWeaponId}`
      );
    }
  }
);

CalculateDamage.run();
