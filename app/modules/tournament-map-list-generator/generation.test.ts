import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createTournamentMapList } from ".";
import { rankedModesShort } from "../in-game-lists/modes";
import { MapPool } from "../map-pool-serializer";
import type { TournamentMaplistInput } from "./types";

const TournamentMapListGenerator = suite("Tournament map list generator");

const team1Picks = new MapPool([
  { mode: "SZ", stageId: 4 },
  { mode: "SZ", stageId: 5 },
  { mode: "TC", stageId: 5 },
  { mode: "TC", stageId: 6 },
  { mode: "RM", stageId: 7 },
  { mode: "RM", stageId: 8 },
  { mode: "CB", stageId: 9 },
  { mode: "CB", stageId: 10 },
]);
const team2Picks = new MapPool([
  { mode: "SZ", stageId: 11 },
  { mode: "SZ", stageId: 9 },
  { mode: "TC", stageId: 2 },
  { mode: "TC", stageId: 8 },
  { mode: "RM", stageId: 7 },
  { mode: "RM", stageId: 1 },
  { mode: "CB", stageId: 2 },
  { mode: "CB", stageId: 3 },
]);
const tiebreakerPicks = new MapPool([
  { mode: "SZ", stageId: 1 },
  { mode: "TC", stageId: 2 },
  { mode: "RM", stageId: 3 },
  { mode: "CB", stageId: 4 },
]);

const generateMaps = ({
  bestOf = 5,
  bracketType = "SE",
  roundNumber = 3,
  teams = [
    {
      name: "Team 1",
      maps: team1Picks,
    },
    {
      name: "Team 2",
      maps: team2Picks,
    },
  ],
  tiebreakerMaps = tiebreakerPicks,
}: Partial<TournamentMaplistInput> = {}) => {
  return createTournamentMapList({
    bestOf,
    bracketType,
    roundNumber,
    teams,
    tiebreakerMaps,
  });
};

TournamentMapListGenerator("Modes are spread evenly", () => {
  const mapList = generateMaps();
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

TournamentMapListGenerator("Equal picks", () => {
  let our = 0;
  let their = 0;
  let tiebreaker = 0;

  const mapList = generateMaps();

  for (const { stageId, mode } of mapList) {
    if (team1Picks.has({ stageId, mode })) {
      our++;
    }

    if (team2Picks.has({ stageId, mode })) {
      their++;
    }

    if (tiebreakerPicks.has({ stageId, mode })) {
      tiebreaker++;
    }
  }

  assert.equal(our, their);
  assert.equal(tiebreaker, 1);
});

TournamentMapListGenerator("No stage repeats in optimal case", () => {
  const mapList = generateMaps();

  const stages = new Set(mapList.map(({ stageId }) => stageId));

  assert.equal(stages.size, 5);
});

TournamentMapListGenerator(
  "Always generates same maplist given same input",
  () => {
    const mapList1 = generateMaps();
    const mapList2 = generateMaps();

    assert.equal(mapList1.length, 5);

    for (let i = 0; i < mapList1.length; i++) {
      assert.equal(mapList1[i]!.stageId, mapList2[i]!.stageId);
      assert.equal(mapList1[i]!.mode, mapList2[i]!.mode);
    }
  }
);

TournamentMapListGenerator(
  "Order of team doesn't matter regarding what maplist gets created",
  () => {
    const mapList1 = generateMaps();
    const mapList2 = generateMaps({
      teams: [
        {
          name: "Team 2",
          maps: team2Picks,
        },
        {
          name: "Team 1",
          maps: team1Picks,
        },
      ],
    });

    assert.equal(mapList1.length, 5);

    for (let i = 0; i < mapList1.length; i++) {
      assert.equal(mapList1[i]!.stageId, mapList2[i]!.stageId);
      assert.equal(mapList1[i]!.mode, mapList2[i]!.mode);
    }
  }
);

const duplicationPicks = new MapPool([
  { mode: "SZ", stageId: 4 },
  { mode: "SZ", stageId: 5 },
  { mode: "TC", stageId: 4 },
  { mode: "TC", stageId: 5 },
  { mode: "RM", stageId: 6 },
  { mode: "RM", stageId: 7 },
  { mode: "CB", stageId: 6 },
  { mode: "CB", stageId: 7 },
]);
const duplicationTiebreaker = new MapPool([
  { mode: "SZ", stageId: 7 },
  { mode: "TC", stageId: 6 },
  { mode: "RM", stageId: 5 },
  { mode: "CB", stageId: 4 },
]);

TournamentMapListGenerator(
  "Uses other teams maps if one didn't submit maplist",
  () => {
    const mapList = generateMaps({
      teams: [
        {
          name: "Team 1",
          maps: new MapPool([]),
        },
        {
          name: "Team 2",
          maps: team2Picks,
        },
      ],
    });

    assert.equal(mapList.length, 5);

    for (let i = 0; i < mapList.length - 1; i++) {
      // map belongs to team 2 map list
      const map = mapList[i];
      assert.ok(map);

      team2Picks.has({ mode: map.mode, stageId: map.stageId });
    }
  }
);

TournamentMapListGenerator(
  "Creates map list even if neither team submitted maps",
  () => {
    const mapList = generateMaps({
      teams: [
        {
          name: "Team 1",
          maps: new MapPool([]),
        },
        {
          name: "Team 2",
          maps: new MapPool([]),
        },
      ],
    });

    assert.equal(mapList.length, 5);
  }
);

TournamentMapListGenerator("Handles worst case with duplication", () => {
  const maplist = generateMaps({
    teams: [
      {
        name: "Team 1",
        maps: duplicationPicks,
      },
      {
        name: "Team 2",
        maps: duplicationPicks,
      },
    ],
    bestOf: 7,
    tiebreakerMaps: duplicationTiebreaker,
  });

  assert.equal(maplist.length, 7);

  // all stages appear
  const stages = new Set(maplist.map(({ stageId }) => stageId));
  assert.equal(stages.size, 4);

  // no consecutive stage replays
  for (let i = 0; i < maplist.length - 1; i++) {
    assert.not.equal(maplist[i]!.stageId, maplist[i + 1]!.stageId);
  }
});

const team2PicksWithSomeDuplication = new MapPool([
  { mode: "SZ", stageId: 4 },
  { mode: "SZ", stageId: 11 },
  { mode: "TC", stageId: 5 },
  { mode: "TC", stageId: 6 },
  { mode: "RM", stageId: 7 },
  { mode: "RM", stageId: 2 },
  { mode: "CB", stageId: 9 },
  { mode: "CB", stageId: 10 },
]);

TournamentMapListGenerator("Keeps things fair when overlap", () => {
  const mapList = generateMaps({
    teams: [
      {
        name: "Team 1",
        maps: team1Picks,
      },
      {
        name: "Team 2",
        maps: team2PicksWithSomeDuplication,
      },
    ],
    bestOf: 7,
  });

  assert.equal(mapList.length, 7);

  let team1PicksAppeared = 0;
  let team2PicksAppeared = 0;

  for (const { stageId, mode } of mapList) {
    if (team1Picks.has({ stageId, mode })) {
      team1PicksAppeared++;
    }

    if (team2PicksWithSomeDuplication.has({ stageId, mode })) {
      team2PicksAppeared++;
    }
  }

  assert.equal(team1PicksAppeared, team2PicksAppeared);
});

TournamentMapListGenerator.run();
