import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  mapModePreferencesToModeList,
  mapPoolFromPreferences,
} from "./match.server";
import * as Test from "~/utils/Test";
import { stageIds } from "~/modules/in-game-lists";

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

const MODES_COUNT = 5;
const STAGES_PER_MODE = 7;

MapPoolFromPreferences("returns maps even if no preferences", () => {
  const mapPool = mapPoolFromPreferences([]);

  assert.equal(mapPool.stageModePairs.length, STAGES_PER_MODE * MODES_COUNT);
});

const MAX_STAGE_ID = Math.max(...stageIds);
MapPoolFromPreferences(
  "tiebreaker if tied preference is stage id (bigger preferred)",
  () => {
    const mapPool = mapPoolFromPreferences([]);

    assert.ok(
      mapPool.stageModePairs.every(
        ({ stageId }) => stageId > MAX_STAGE_ID - STAGES_PER_MODE,
      ),
    );
  },
);

MapPoolFromPreferences("returns maps even if no preferences", () => {
  const mapPool = mapPoolFromPreferences([]);

  assert.equal(mapPool.stageModePairs.length, STAGES_PER_MODE * MODES_COUNT);
});

MapPoolFromPreferences("preferring map causes it to be included", () => {
  const mapPool = mapPoolFromPreferences([
    [{ stageId: 0, preference: "PREFER", mode: "SZ" }],
  ]);

  assert.ok(
    mapPool.stageModePairs.some(
      (pair) => pair.stageId === 0 && pair.mode === "SZ",
    ),
  );
});

MapPoolFromPreferences("maps are voted upon", () => {
  const mapPool = mapPoolFromPreferences([
    [{ stageId: 0, preference: "PREFER", mode: "SZ" }],
    [{ stageId: 0, preference: "AVOID", mode: "SZ" }],
    [{ stageId: 0, preference: "AVOID", mode: "SZ" }],
  ]);

  assert.not.ok(
    mapPool.stageModePairs.some(
      (pair) => pair.stageId === 0 && pair.mode === "SZ",
    ),
  );
});

MapPoolFromPreferences(
  "most popular maps are returned even if nothing to be avoided",
  () => {
    const commonPreferences = stageIds.map(
      (stageId) =>
        ({
          stageId,
          preference: "PREFER",
          mode: "SZ",
        }) as const,
    );

    const mapPool = mapPoolFromPreferences([
      commonPreferences,
      commonPreferences,
      commonPreferences,
      commonPreferences.filter((pref) => pref.stageId !== 19),
    ]);

    assert.not.ok(
      mapPool.stageModePairs.some(
        (pair) => pair.stageId === 19 && pair.mode === "SZ",
      ),
    );
  },
);

MapPoolFromPreferences("works across multiple modes", () => {
  const mapPool = mapPoolFromPreferences([
    [
      { stageId: 0, preference: "PREFER", mode: "SZ" },
      { stageId: 1, preference: "PREFER", mode: "TC" },
    ],
    [{ stageId: 2, preference: "PREFER", mode: "RM" }],
  ]);

  assert.ok(
    mapPool.stageModePairs.some(
      (pair) => pair.stageId === 0 && pair.mode === "SZ",
    ),
  );
  assert.ok(
    mapPool.stageModePairs.some(
      (pair) => pair.stageId === 1 && pair.mode === "TC",
    ),
  );
  assert.ok(
    mapPool.stageModePairs.some(
      (pair) => pair.stageId === 2 && pair.mode === "RM",
    ),
  );
});

MapModePreferencesToModeList.run();
MapPoolFromPreferences.run();
