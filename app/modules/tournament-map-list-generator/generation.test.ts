import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createTournamentMapList } from ".";
import type { RankedModeShort } from "../in-game-lists";
import { rankedModesShort } from "../in-game-lists/modes";
import { MapPool } from "../map-pool-serializer";
import type { TournamentMaplistInput } from "./types";

const TournamentMapListGenerator = suite("Tournament map list generator");
const TournamentMapListGeneratorOneMode = suite(
  "Tournament map list generator (one mode)"
);

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
  { mode: "TC", stageId: 11 },
  { mode: "RM", stageId: 3 },
  { mode: "CB", stageId: 4 },
]);

const generateMaps = ({
  bestOf = 5,
  bracketType = "SE",
  roundNumber = 3,
  teams = [
    {
      id: 1,
      maps: team1Picks,
    },
    {
      id: 2,
      maps: team2Picks,
    },
  ],
  tiebreakerMaps = tiebreakerPicks,
  modesIncluded = [...rankedModesShort],
}: Partial<TournamentMaplistInput> = {}) => {
  return createTournamentMapList({
    bestOf,
    bracketType,
    roundNumber,
    teams,
    tiebreakerMaps,
    modesIncluded,
  });
};

TournamentMapListGenerator("Modes are spread evenly", () => {
  const mapList = generateMaps();
  const modes = new Set(rankedModesShort);

  assert.equal(mapList.length, 5);

  for (const [i, { mode }] of mapList.entries()) {
    const rankedMode = mode as RankedModeShort;
    if (!modes.has(rankedMode)) {
      assert.equal(i, 4, "Repeated mode early");
      assert.equal(mode, mapList[0]!.mode, "1st and 5th mode are not the same");
    }

    modes.delete(rankedMode);
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
          id: 2,
          maps: team2Picks,
        },
        {
          id: 1,
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

TournamentMapListGenerator(
  "Order of maps in the list doesn't matter regarding what maplist gets created",
  () => {
    const mapList1 = generateMaps({
      teams: [
        {
          id: 1,
          maps: team1Picks,
        },
        {
          id: 2,
          maps: team2Picks,
        },
      ],
    });
    const mapList2 = generateMaps({
      teams: [
        {
          id: 1,
          maps: team1Picks,
        },
        {
          id: 2,
          maps: new MapPool(team2Picks.stageModePairs.slice().reverse()),
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
          id: 1,
          maps: new MapPool([]),
        },
        {
          id: 2,
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
          id: 1,
          maps: new MapPool([]),
        },
        {
          id: 2,
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
        id: 1,
        maps: duplicationPicks,
      },
      {
        id: 2,
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
        id: 1,
        maps: team1Picks,
      },
      {
        id: 2,
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

TournamentMapListGenerator("No map picked by same team twice in row", () => {
  for (let i = 1; i <= 10; i++) {
    const mapList = generateMaps({
      teams: [
        {
          id: 1,
          maps: team1Picks,
        },
        {
          id: 2,
          maps: team2Picks,
        },
      ],
      roundNumber: i,
    });

    for (let j = 0; j < mapList.length - 1; j++) {
      if (typeof mapList[j]!.source !== "number") continue;
      assert.not.equal(mapList[j]!.source, mapList[j + 1]!.source);
    }
  }
});

const team1SZPicks = new MapPool([
  { mode: "SZ", stageId: 4 },
  { mode: "SZ", stageId: 5 },
  { mode: "SZ", stageId: 6 },
  { mode: "SZ", stageId: 7 },
  { mode: "SZ", stageId: 8 },
  { mode: "SZ", stageId: 9 },
]);
const team2SZPicks = new MapPool([
  { mode: "SZ", stageId: 1 },
  { mode: "SZ", stageId: 2 },
  { mode: "SZ", stageId: 3 },
  { mode: "SZ", stageId: 9 },
  { mode: "SZ", stageId: 10 },
  { mode: "SZ", stageId: 11 },
]);
const team2SZPicksNoOverlap = new MapPool([
  { mode: "SZ", stageId: 1 },
  { mode: "SZ", stageId: 2 },
  { mode: "SZ", stageId: 3 },
  { mode: "SZ", stageId: 14 },
  { mode: "SZ", stageId: 10 },
  { mode: "SZ", stageId: 11 },
]);

TournamentMapListGeneratorOneMode(
  "Creates map list for one mode inferring from the team picks",
  () => {
    const mapList = generateMaps({
      teams: [
        {
          id: 1,
          maps: team1SZPicks,
        },
        {
          id: 2,
          maps: team2SZPicks,
        },
      ],
      modesIncluded: ["SZ"],
      tiebreakerMaps: new MapPool([]),
    });
    for (let i = 0; i < mapList.length - 1; i++) {
      assert.equal(mapList[i]!.mode, "SZ");
    }
  }
);

TournamentMapListGeneratorOneMode(
  "Creates one mode map list from empty map lists",
  () => {
    const mapList = generateMaps({
      teams: [
        {
          id: 1,
          maps: new MapPool([]),
        },
        {
          id: 2,
          maps: new MapPool([]),
        },
      ],
      modesIncluded: ["SZ"],
      tiebreakerMaps: new MapPool([]),
    });
    for (let i = 0; i < mapList.length - 1; i++) {
      assert.equal(mapList[i]!.mode, "SZ");
    }
  }
);

TournamentMapListGeneratorOneMode(
  "Creates all different maps from empty map lists",
  () => {
    const mapList = generateMaps({
      teams: [
        {
          id: 1,
          maps: new MapPool([]),
        },
        {
          id: 2,
          maps: new MapPool([]),
        },
      ],
      modesIncluded: ["SZ"],
      tiebreakerMaps: new MapPool([]),
    });

    const stages = new Set(mapList.map(({ stageId }) => stageId));
    assert.equal(stages.size, 5);
  }
);

TournamentMapListGeneratorOneMode(
  "Tiebreaker is always from the maps of the teams when possible",
  () => {
    for (let i = 1; i <= 10; i++) {
      const mapList = generateMaps({
        teams: [
          {
            id: 1,
            maps: team1SZPicks,
          },
          {
            id: 2,
            maps: team2SZPicks,
          },
        ],
        modesIncluded: ["SZ"],
        roundNumber: i,
        tiebreakerMaps: new MapPool([]),
      });

      const last = mapList[mapList.length - 1];

      assert.equal(last?.mode, "SZ");
      assert.equal(last?.stageId, 9);
    }
  }
);

TournamentMapListGeneratorOneMode(
  "Tiebreaker is from neither team's pool if no overlap",
  () => {
    const mapList = generateMaps({
      teams: [
        {
          id: 1,
          maps: team1SZPicks,
        },
        {
          id: 2,
          maps: team2SZPicksNoOverlap,
        },
      ],
      modesIncluded: ["SZ"],
      tiebreakerMaps: new MapPool([]),
    });

    const last = mapList[mapList.length - 1];

    assert.not.ok(
      team1SZPicks.stageModePairs.some(
        ({ stageId }) => stageId === last?.stageId
      )
    );
    assert.not.ok(
      team2SZPicksNoOverlap.stageModePairs.some(
        ({ stageId }) => stageId === last?.stageId
      )
    );
  }
);

TournamentMapListGeneratorOneMode("Handles worst case duplication", () => {
  const mapList = generateMaps({
    teams: [
      {
        id: 1,
        maps: team1SZPicks,
      },
      {
        id: 2,
        maps: team1SZPicks,
      },
    ],
    modesIncluded: ["SZ"],
    tiebreakerMaps: new MapPool([]),
    bestOf: 7,
  });

  for (const [i, stage] of mapList.entries()) {
    if (i === 6) {
      assert.equal(stage?.source, "TIEBREAKER");
    } else {
      assert.equal(stage?.source, "BOTH");
    }
  }
});

TournamentMapListGeneratorOneMode("Handles one team submitted no maps", () => {
  const mapList = generateMaps({
    teams: [
      {
        id: 1,
        maps: team1SZPicks,
      },
      {
        id: 2,
        maps: new MapPool([]),
      },
    ],
    modesIncluded: ["SZ"],
    tiebreakerMaps: new MapPool([]),
  });

  for (const stage of mapList) {
    assert.equal(stage.source, 1);
  }
});

TournamentMapListGenerator.run();
TournamentMapListGeneratorOneMode.run();
