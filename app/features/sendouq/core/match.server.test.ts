import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { UserMapModePreferences } from "~/db/tables";
import type { StageId } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import * as Test from "~/utils/Test";
import { nullFilledArray } from "~/utils/arrays";
import { mapLottery, mapModePreferencesToModeList } from "./match.server";
import { SENDOUQ_DEFAULT_MAPS } from "~/modules/tournament-map-list-generator/constants";

const MapModePreferencesToModeList = suite("mapModePreferencesToModeList()");
const MapPoolFromPreferences = suite("mapPoolFromPreferences()");

MapModePreferencesToModeList("returns default list if no preferences", () => {
  const modeList = mapModePreferencesToModeList([], []);

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

MapModePreferencesToModeList(
  "returns default list if equally disliking everything",
  () => {
    const dislikingEverything = [
      { mode: "TW", preference: "AVOID" } as const,
      { mode: "SZ", preference: "AVOID" } as const,
      { mode: "TC", preference: "AVOID" } as const,
      { mode: "RM", preference: "AVOID" } as const,
      { mode: "CB", preference: "AVOID" } as const,
    ];

    const modeList = mapModePreferencesToModeList(
      [
        dislikingEverything,
        dislikingEverything,
        dislikingEverything,
        dislikingEverything,
      ],
      [
        dislikingEverything,
        dislikingEverything,
        dislikingEverything,
        dislikingEverything,
      ],
    );

    assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
  },
);

MapModePreferencesToModeList(
  "if positive about nothing, choose the most liked (-TW)",
  () => {
    const modeList = mapModePreferencesToModeList(
      [[{ mode: "SZ", preference: "AVOID" }]],
      [],
    );

    assert.ok(Test.arrayContainsSameItems(["TC", "RM", "CB"], modeList));
  },
);

MapModePreferencesToModeList(
  "only turf war possible to get if least bad option",
  () => {
    const modeList = mapModePreferencesToModeList(
      [
        [
          { mode: "SZ", preference: "AVOID" },
          { mode: "TC", preference: "AVOID" },
          { mode: "RM", preference: "AVOID" },
          { mode: "CB", preference: "AVOID" },
          { mode: "TW", preference: "AVOID" },
        ],
        [{ mode: "TW", preference: "PREFER" }],
      ],
      [],
    );

    assert.ok(Test.arrayContainsSameItems(["TW"], modeList));
  },
);

MapModePreferencesToModeList("team votes for their preference", () => {
  const modeList = mapModePreferencesToModeList(
    [
      [
        { mode: "SZ", preference: "PREFER" },
        { mode: "TC", preference: "PREFER" },
      ],
      [{ mode: "TC", preference: "PREFER" }],
      [{ mode: "TC", preference: "AVOID" }],
      [{ mode: "TC", preference: "PREFER" }],
    ],
    [
      [{ mode: "TC", preference: "PREFER" }],
      [{ mode: "TC", preference: "PREFER" }],
      [{ mode: "TC", preference: "AVOID" }],
      [{ mode: "TC", preference: "AVOID" }],
    ],
  );

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC"], modeList));
});

MapModePreferencesToModeList(
  "favorite ranked mode sorted first in the array",
  () => {
    assert.equal(
      mapModePreferencesToModeList(
        [[{ mode: "TC", preference: "PREFER" }]],
        [],
      )[0],
      "TC",
    );
  },
);

MapModePreferencesToModeList(
  "includes turf war if more prefer than want to avoid",
  () => {
    const modeList = mapModePreferencesToModeList(
      [[{ mode: "TW", preference: "PREFER" }]],
      [[{ mode: "SZ", preference: "PREFER" }]],
    );

    assert.ok(Test.arrayContainsSameItems(["TW", "SZ"], modeList));
  },
);

MapModePreferencesToModeList("doesn't include turf war if mixed", () => {
  const modeList = mapModePreferencesToModeList(
    [[{ mode: "TW", preference: "PREFER" }]],
    [[{ mode: "TW", preference: "AVOID" }]],
  );

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

const MODES_COUNT = 4;
const STAGES_PER_MODE = 7;

MapPoolFromPreferences("returns maps even if no preferences", () => {
  const mapPool = mapLottery([], rankedModesShort);

  assert.equal(mapPool.stageModePairs.length, STAGES_PER_MODE * MODES_COUNT);
});

MapPoolFromPreferences("returns some maps from the map pools", () => {
  const memberOnePool: UserMapModePreferences["pool"] = rankedModesShort.map(
    (mode) => ({
      mode,
      stages: nullFilledArray(7).map((_, i) => (i + 1) as StageId),
    }),
  );
  const memberTwoPool: UserMapModePreferences["pool"] = rankedModesShort.map(
    (mode) => ({
      mode,
      stages: nullFilledArray(7).map((_, i) => (i + 10) as StageId),
    }),
  );

  const pool = mapLottery(
    [
      { modes: [], pool: memberOnePool },
      { modes: [], pool: memberTwoPool },
    ],
    rankedModesShort,
  );

  assert.ok(
    pool.stageModePairs.some((p) => p.stageId <= 7),
    "No map from memberOnePool",
  );
  assert.ok(
    pool.stageModePairs.some((p) => p.stageId > 10),
    "No map from memberTwoPool",
  );
});

MapPoolFromPreferences(
  "includes modes that were given and nothing else",
  () => {
    const memberOnePool: UserMapModePreferences["pool"] = rankedModesShort.map(
      (mode) => ({
        mode,
        stages: nullFilledArray(7).map((_, i) => (i + 1) as StageId),
      }),
    );

    const pool = mapLottery([{ modes: [], pool: memberOnePool }], ["SZ", "TC"]);

    assert.ok(
      pool.stageModePairs.every((p) => p.mode === "SZ" || p.mode === "TC"),
    );
  },
);

MapPoolFromPreferences("excludes map preferences if mode is avoided", () => {
  const memberOnePool: UserMapModePreferences["pool"] = [
    {
      mode: "SZ",
      stages: nullFilledArray(7).map((_, i) => (i + 1) as StageId),
    },
  ];

  const pool = mapLottery(
    [{ modes: [{ preference: "AVOID", mode: "SZ" }], pool: memberOnePool }],
    ["SZ"],
  );

  assert.ok(
    pool.stageModePairs.every((p) =>
      SENDOUQ_DEFAULT_MAPS["SZ"].some((stageId) => stageId === p.stageId),
    ),
  );
});

MapModePreferencesToModeList.run();
MapPoolFromPreferences.run();
