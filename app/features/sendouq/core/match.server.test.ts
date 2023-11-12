import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  mapModePreferencesToModeList,
  mapPoolFromPreferences,
} from "./match.server";
import * as Test from "~/utils/Test";

const MapModePreferencesToModeList = suite("mapModePreferencesToModeList()");
const MapPoolFromPreferences = suite("mapPoolFromPreferences()");

MapModePreferencesToModeList("returns default list if no preferences", () => {
  const modeList = mapModePreferencesToModeList([], []);

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

MapModePreferencesToModeList(
  "mode excluded if more want to avoid than prefer",
  () => {
    const modeList = mapModePreferencesToModeList(
      [
        { mode: "SZ", preference: "PREFER" },
        { mode: "SZ", preference: "AVOID" },
      ],
      [{ mode: "SZ", preference: "AVOID" }],
    );

    assert.ok(Test.arrayContainsSameItems(["TC", "RM", "CB"], modeList));
  },
);

MapModePreferencesToModeList("ranked modes included if mixed", () => {
  const modeList = mapModePreferencesToModeList(
    [{ mode: "SZ", preference: "PREFER" }],
    [{ mode: "SZ", preference: "AVOID" }],
  );

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

MapModePreferencesToModeList("team preferences are grouped together", () => {
  const modeList = mapModePreferencesToModeList(
    [
      { mode: "TC", preference: "AVOID" },
      { mode: "TC", preference: "AVOID" },
    ],
    [{ mode: "TC", preference: "PREFER" }],
  );

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

MapModePreferencesToModeList("team votes for their preference", () => {
  const modeList = mapModePreferencesToModeList(
    [
      { mode: "TC", preference: "PREFER" },
      { mode: "TC", preference: "PREFER" },
      { mode: "TC", preference: "AVOID" },
      { mode: "TC", preference: "PREFER" },
    ],
    [
      { mode: "TC", preference: "AVOID" },
      { mode: "TC", preference: "AVOID" },
      { mode: "TC", preference: "AVOID" },
      { mode: "TC", preference: "AVOID" },
    ],
  );

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

MapModePreferencesToModeList(
  "favorite ranked mode sorted first in the array",
  () => {
    assert.equal(
      mapModePreferencesToModeList(
        [{ mode: "TC", preference: "PREFER" }],
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
      [{ mode: "TW", preference: "PREFER" }],
      [],
    );

    assert.ok(
      Test.arrayContainsSameItems(["TW", "SZ", "TC", "RM", "CB"], modeList),
    );
  },
);

MapModePreferencesToModeList("doesn't include turf war if mixed", () => {
  const modeList = mapModePreferencesToModeList(
    [{ mode: "TW", preference: "PREFER" }],
    [{ mode: "TW", preference: "AVOID" }],
  );

  assert.ok(Test.arrayContainsSameItems(["SZ", "TC", "RM", "CB"], modeList));
});

const MODES_COUNT = 5;
const STAGES_PER_MODE = 6;

MapPoolFromPreferences("returns maps even if no preferences", () => {
  const mapPool = mapPoolFromPreferences([]);

  assert.equal(mapPool.stageModePairs.length, STAGES_PER_MODE * MODES_COUNT);
});

MapModePreferencesToModeList.run();
MapPoolFromPreferences.run();
