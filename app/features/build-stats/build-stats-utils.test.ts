import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  abilityPointCountsToAverages,
  popularBuilds,
} from "./build-stats-utils";

const AbilityPointCountsToAverages = suite("abilityPointCountsToAverages()");
const PopularBuilds = suite("popularBuilds()");

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
    50,
  );
});

AbilityPointCountsToAverages("calculates average ap (stackable)", () => {
  const { stackableAbilities } = abilityPointCountsToAverages({
    allAbilities,
    weaponAbilities: commonAbilities,
  });

  assert.is(
    stackableAbilities.find((a) => a.name === "SS")?.apAverage.weapon,
    13.5,
  );
});

AbilityPointCountsToAverages("calculates average ap for all builds", () => {
  const { mainOnlyAbilities } = abilityPointCountsToAverages({
    allAbilities,
    weaponAbilities: commonAbilities,
  });

  assert.is(
    mainOnlyAbilities.find((a) => a.name === "T")?.percentage.all,
    33.33,
  );
});

PopularBuilds("calculates popular build", () => {
  const builds = popularBuilds([
    ...new Array(10).fill(null).map(() => ({
      abilities: [{ ability: "QR" as const, abilityPoints: 57 }],
    })),
    {
      abilities: [{ ability: "BRU" as const, abilityPoints: 57 }],
    },
  ]);

  assert.is(builds.length, 1);
  assert.is(builds[0]!.count, 10);
  assert.is(builds[0]!.abilities[0]!.ability, "QR");
});

PopularBuilds("calculates second most popular build (sorted by count)", () => {
  const builds = popularBuilds([
    ...new Array(10).fill(null).map(() => ({
      abilities: [{ ability: "QR" as const, abilityPoints: 57 }],
    })),
    ...new Array(3).fill(null).map(() => ({
      abilities: [{ ability: "SS" as const, abilityPoints: 57 }],
    })),
    ...new Array(5).fill(null).map(() => ({
      abilities: [{ ability: "SSU" as const, abilityPoints: 57 }],
    })),
  ]);

  assert.is(builds.length, 3);
  assert.is(builds[1]!.abilities[0]!.ability, "SSU");
});

PopularBuilds("sums up abilities", () => {
  const builds = popularBuilds([
    { abilities: [{ ability: "QR" as const, abilityPoints: 57 }] },
    {
      abilities: [
        { ability: "QR" as const, abilityPoints: 10 },
        { ability: "QR" as const, abilityPoints: 47 },
      ],
    },
  ]);

  assert.is(builds.length, 1);
});

PopularBuilds("sorts abilities", () => {
  const builds = popularBuilds([
    {
      abilities: [
        { ability: "QR" as const, abilityPoints: 10 },
        { ability: "SS" as const, abilityPoints: 47 },
      ],
    },
    {
      abilities: [
        { ability: "QR" as const, abilityPoints: 10 },
        { ability: "SS" as const, abilityPoints: 47 },
      ],
    },
  ]);

  assert.is(builds[0]!.abilities[1]!.ability, "QR");
});

AbilityPointCountsToAverages.run();
PopularBuilds.run();
