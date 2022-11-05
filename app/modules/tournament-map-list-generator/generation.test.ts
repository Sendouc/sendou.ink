import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createTournamentMapList } from ".";
import { rankedModesShort } from "../in-game-lists/modes";
import { MapPool } from "../map-pool-serializer";
import type { TournamentMaplistInput } from "./types";

const TournamentMapListGenerator = suite("Tournament map list generator");

const generateMaps = ({
  bestOf = 5,
  bracketType = "SE",
  roundNumber = 3,
  teams = [
    {
      name: "Team 1",
      maps: new MapPool([
        { mode: "SZ", stageId: 4 },
        { mode: "SZ", stageId: 5 },
        { mode: "TC", stageId: 5 },
        { mode: "TC", stageId: 6 },
        { mode: "RM", stageId: 7 },
        { mode: "RM", stageId: 8 },
        { mode: "CB", stageId: 9 },
        { mode: "CB", stageId: 10 },
      ]),
    },
    {
      name: "Team 2",
      maps: new MapPool([
        { mode: "SZ", stageId: 11 },
        { mode: "SZ", stageId: 9 },
        { mode: "TC", stageId: 2 },
        { mode: "TC", stageId: 8 },
        { mode: "RM", stageId: 7 },
        { mode: "RM", stageId: 1 },
        { mode: "CB", stageId: 2 },
        { mode: "CB", stageId: 3 },
      ]),
    },
  ],
  tiebreakerMaps = new MapPool([
    { mode: "SZ", stageId: 1 },
    { mode: "TC", stageId: 2 },
    { mode: "RM", stageId: 3 },
    { mode: "CB", stageId: 4 },
  ]),
}: Partial<TournamentMaplistInput>) => {
  return createTournamentMapList({
    bestOf,
    bracketType,
    roundNumber,
    teams,
    tiebreakerMaps,
  });
};

// generates map list with equal picks (our, their, our, their, tiebreaker)
// no stage repeats in optimal case
// always generates same map list given same input
// order of team doesn't matter
// worst case with duplication (identical maplists and overlap with tiebreaker)
// if some overlap in maplist, keeps it fair (same amount of "picked" maps)
// if no maplist from other team then pick maps from the team who submitted
// makes maplist even if neither team submitted maps

TournamentMapListGenerator("Modes are spread evenly", () => {
  const mapList = generateMaps({});
  const modes = new Set(rankedModesShort);

  assert.equal(mapList.length, 5);

  for (const [i, { mode }] of mapList.entries()) {
    if (!modes.has(mode)) {
      assert.equal(i, 4, "Repeated mode early");
      assert.equal(mode, mapList[0]!.mode, "1st and 5th mode are not the same");
    }

    modes.delete(mode);
  }
});

TournamentMapListGenerator.run();
