import { suite } from "uvu";
import * as assert from "uvu/assert";
import { abilityPointCountsToAverages } from "./build-stats-utils";

const AbilityPointCountsToAverages = suite("abilityPointCountsToAverages()");

const commonAbilities = [
  {
    ability: "QR" as const,
    abilityPointsSum: 57,
  },
  {
    ability: "SJ" as const,
    abilityPointsSum: 10,
  },
  {
    ability: "CB" as const,
    abilityPointsSum: 10,
  },
  {
    ability: "T" as const,
    abilityPointsSum: 10,
  },
  {
    ability: "SS" as const,
    abilityPointsSum: 27,
  },
];

const allAbilities = [
  ...commonAbilities,
  { ability: "BRU" as const, abilityPointsSum: 57 },
];

AbilityPointCountsToAverages("calculates build count", () => {
  const { weaponBuildsCount } = abilityPointCountsToAverages({
    allAbilities,
    weaponAbilities: commonAbilities,
  });

  assert.is(weaponBuildsCount, 2);
});

AbilityPointCountsToAverages("calculates average ap (main only)", () => {
  const { mainOnlyAbilities } = abilityPointCountsToAverages({
    allAbilities,
    weaponAbilities: commonAbilities,
  });

  assert.is(
    mainOnlyAbilities.find((a) => a.name === "T")?.percentage.weapon,
    50
  );
});

AbilityPointCountsToAverages("calculates average ap (stackable)", () => {
  const { stackableAbilities } = abilityPointCountsToAverages({
    allAbilities,
    weaponAbilities: commonAbilities,
  });

  assert.is(
    stackableAbilities.find((a) => a.name === "SS")?.apAverage.weapon,
    13.5
  );
});

AbilityPointCountsToAverages("calculates average ap for all builds", () => {
  const { mainOnlyAbilities } = abilityPointCountsToAverages({
    allAbilities,
    weaponAbilities: commonAbilities,
  });

  assert.is(
    mainOnlyAbilities.find((a) => a.name === "T")?.percentage.all,
    33.33
  );
});

AbilityPointCountsToAverages.run();
