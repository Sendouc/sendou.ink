import type { Mode } from ".prisma/client";
import clone from "just-clone";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { mapPoolForTest } from "~/utils/testUtils";
import { eliminationBracket } from "./algorithms";
import { getRoundsDefaultBestOf } from "./bracket";
import { generateMapListForRounds } from "./mapList";

const MapListForRounds = suite("generateMapListMapForRounds()");

const ALL_MODES_LENGTH = 4;
const mapPool = mapPoolForTest();
const bracket = eliminationBracket(100, "DE");
const rounds = getRoundsDefaultBestOf(bracket);
const mapList = generateMapListForRounds({ mapPool, rounds });

MapListForRounds("No mode is repeated in the same round", () => {
  for (const side of [mapList.winners, mapList.losers]) {
    for (const round of side) {
      for (const [i, stage] of round.entries()) {
        if (i === 0) continue;

        assert.not.equal(stage.mode, round[i - 1]?.mode);
      }
    }
  }
});

MapListForRounds("Should have all the map and mode combos", () => {
  let mapPoolToEmpty = clone(mapPool);
  for (const side of [mapList.winners, mapList.losers]) {
    for (const round of side) {
      for (const stage of round) {
        mapPoolToEmpty = mapPoolToEmpty.filter(
          (obj) => obj.name !== stage.name && obj.mode !== stage.mode
        );
      }
    }
  }

  assert.equal(mapPoolToEmpty.length, 0);
});

MapListForRounds(
  "Should not repeat mode (except SZ) in a round before other modes have appeared",
  () => {
    for (const side of [mapList.winners, mapList.losers]) {
      for (const round of side) {
        const modes: Mode[] = [];
        for (const stage of round) {
          if (
            modes.includes(stage.mode) &&
            modes.length < ALL_MODES_LENGTH &&
            stage.mode !== "SZ"
          ) {
            throw new Error(`Repeated mode: ${JSON.stringify(round, null, 2)}`);
          }
          modes.push(stage.mode);
        }
      }
    }
  }
);

// TODO: flaky
MapListForRounds("Should not repeat map in adjacent rounds", () => {
  for (const side of [mapList.winners, mapList.losers]) {
    let maps: string[] = [];
    let newMaps: string[] = [];
    for (const round of side) {
      for (const stage of round) {
        if (maps.includes(stage.name)) {
          throw new Error(`Repeating map: ${stage.name}`);
        }

        newMaps.push(stage.name);
      }

      maps = newMaps;
      newMaps = [];
    }
  }
});

MapListForRounds(
  "Should generate a map list even if only one map/mode combo (SZ)",
  () => {
    const mapListOfRepeatingNature = generateMapListForRounds({
      mapPool: [{ id: 1, mode: "SZ", name: "The Reef" }],
      rounds,
    });

    assert.equal(
      mapListOfRepeatingNature.winners.length,
      mapList.winners.length
    );
  }
);

MapListForRounds(
  "Should generate a map list even if only one map/mode combo (TC)",
  () => {
    const mapListOfRepeatingNature = generateMapListForRounds({
      mapPool: [{ id: 1, mode: "TC", name: "The Reef" }],
      rounds,
    });

    assert.equal(
      mapListOfRepeatingNature.winners.length,
      mapList.winners.length
    );
  }
);

MapListForRounds.run();
