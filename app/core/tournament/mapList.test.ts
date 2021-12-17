import type { Mode, Stage } from ".prisma/client";
import clone from "just-clone";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { eliminationBracket } from "./algorithms";
import { getRoundsDefaultBestOf } from "./bracket";
import { generateMapListForRounds } from "./mapList";

const MapListForRounds = suite("generateMapListMapForRounds()");

const ALL_MODES_LENGTH = 4;
const mapPool: Stage[] = JSON.parse(
  `[{"id":923,"mode":"TC","name":"The Reef"},{"id":925,"mode":"CB","name":"The Reef"},{"id":927,"mode":"SZ","name":"Musselforge Fitness"},{"id":929,"mode":"RM","name":"Musselforge Fitness"},{"id":934,"mode":"RM","name":"Starfish Mainstage"},{"id":942,"mode":"SZ","name":"Inkblot Art Academy"},{"id":943,"mode":"TC","name":"Inkblot Art Academy"},{"id":947,"mode":"SZ","name":"Sturgeon Shipyard"},{"id":948,"mode":"TC","name":"Sturgeon Shipyard"},{"id":953,"mode":"TC","name":"Moray Towers"},{"id":959,"mode":"RM","name":"Port Mackerel"},{"id":960,"mode":"CB","name":"Port Mackerel"},{"id":972,"mode":"SZ","name":"Snapper Canal"},{"id":978,"mode":"TC","name":"Blackbelly Skatepark"},{"id":980,"mode":"CB","name":"Blackbelly Skatepark"},{"id":985,"mode":"CB","name":"MakoMart"},{"id":987,"mode":"SZ","name":"Walleye Warehouse"},{"id":988,"mode":"TC","name":"Walleye Warehouse"},{"id":994,"mode":"RM","name":"Shellendorf Institute"},{"id":995,"mode":"CB","name":"Shellendorf Institute"},{"id":1007,"mode":"SZ","name":"Piranha Pit"},{"id":1012,"mode":"SZ","name":"Camp Triggerfish"},{"id":1019,"mode":"RM","name":"Wahoo World"},{"id":1020,"mode":"CB","name":"Wahoo World"},{"id":1027,"mode":"SZ","name":"Ancho-V Games"},{"id":1034,"mode":"RM","name":"Skipper Pavilion"}]`
);
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
