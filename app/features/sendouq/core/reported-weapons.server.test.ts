import { suite } from "uvu";
import * as assert from "uvu/assert";
import { mergeReportedWeapons } from "./reported-weapons.server";
import type { MainWeaponId } from "~/modules/in-game-lists";

const MergeReportedWeapons = suite("mergeReportedWeapons()");

const newWeapons: Parameters<typeof mergeReportedWeapons>[0]["newWeapons"] = [
  {
    groupMatchMapId: 1,
    mapIndex: 0,
    userId: 1,
    weaponSplId: 0 as MainWeaponId,
  },
];

MergeReportedWeapons("handles no old weapons", () => {
  const result = mergeReportedWeapons({ newWeapons, oldWeapons: [] });

  assert.equal(result, newWeapons);
});

MergeReportedWeapons("replaces a weapon", () => {
  const result = mergeReportedWeapons({
    newWeapons,
    oldWeapons: [
      {
        groupMatchMapId: 1,
        mapIndex: 0,
        userId: 1,
        weaponSplId: 1 as MainWeaponId,
      },
    ],
  });

  assert.equal(result, newWeapons);
});

MergeReportedWeapons("merges two completely separate lists", () => {
  const result = mergeReportedWeapons({
    newWeapons,
    oldWeapons: [
      {
        groupMatchMapId: 1,
        mapIndex: 0,
        userId: 2,
        weaponSplId: 0 as MainWeaponId,
      },
    ],
  });

  assert.equal(result, [
    {
      groupMatchMapId: 1,
      mapIndex: 0,
      userId: 2,
      weaponSplId: 0 as MainWeaponId,
    },
    ...newWeapons,
  ]);
});

MergeReportedWeapons("handles merging partially same list", () => {
  const result = mergeReportedWeapons({
    newWeapons,
    oldWeapons: [
      {
        groupMatchMapId: 1,
        mapIndex: 0,
        userId: 1,
        weaponSplId: 1 as MainWeaponId,
      },
      {
        groupMatchMapId: 1,
        mapIndex: 0,
        userId: 2,
        weaponSplId: 0 as MainWeaponId,
      },
    ],
  });

  assert.equal(result, [
    ...newWeapons,
    {
      groupMatchMapId: 1,
      mapIndex: 0,
      userId: 2,
      weaponSplId: 0 as MainWeaponId,
    },
  ]);
});

MergeReportedWeapons("slices unplayed maps", () => {
  const result = mergeReportedWeapons({
    newWeapons,
    oldWeapons: [
      {
        groupMatchMapId: 1,
        mapIndex: 1,
        userId: 1,
        weaponSplId: 0 as MainWeaponId,
      },
    ],
    newReportedMapsCount: 1,
  });

  assert.equal(result, newWeapons);
});

MergeReportedWeapons.run();
