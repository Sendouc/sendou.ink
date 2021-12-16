import { Mode, Stage } from ".prisma/client";
import clone from "just-clone";
import invariant from "tiny-invariant";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { eliminationBracket } from "./algorithms";
import { getRoundsDefaultBestOf } from "./bracket";
import { generateMapListForRounds } from "./mapList";

const MapListForRounds = suite("generateMapListMapForRounds()");

const modes: Mode[] = ["SZ", "TC", "RM", "CB"];
const mapPool: Stage[] = ["a", "b", "c", "d", "e", "f", "g"].map((name, i) => {
  const mode = modes.shift();
  invariant(mode, "Unexpected no mode");
  modes.push(mode);
  return { name, id: i, mode };
});
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

MapListForRounds.run();
