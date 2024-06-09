import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Status } from "~/db/types";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const CreateDoubleElimination = suite("Delete stage");

CreateDoubleElimination.before.each(() => {
  storage.reset();
});

CreateDoubleElimination("should create a double elimination stage", () => {
  manager.create({
    name: "Amateur",
    tournamentId: 0,
    type: "double_elimination",
    seeding: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    settings: { seedOrdering: ["natural"], grandFinal: "simple" },
  });

  const stage = storage.select<any>("stage", 0);
  assert.equal(stage.name, "Amateur");
  assert.equal(stage.type, "double_elimination");

  assert.equal(storage.select<any>("group")!.length, 3);
  assert.equal(storage.select<any>("round")!.length, 4 + 6 + 1);
  assert.equal(storage.select<any>("match")!.length, 30);
});

CreateDoubleElimination(
  "should create a tournament with 256+ tournaments",
  () => {
    manager.create({
      name: "Example with 256 participants",
      tournamentId: 0,
      type: "double_elimination",
      settings: { size: 256 },
    });
  },
);

CreateDoubleElimination(
  "should create a tournament with a double grand final",
  () => {
    manager.create({
      name: "Example with double grand final",
      tournamentId: 0,
      type: "double_elimination",
      seeding: [1, 2, 3, 4, 5, 6, 7, 8],
      settings: { grandFinal: "double", seedOrdering: ["natural"] },
    });

    assert.equal(storage.select<any>("group")!.length, 3);
    assert.equal(storage.select<any>("round")!.length, 3 + 4 + 2);
    assert.equal(storage.select<any>("match")!.length, 15);
  },
);

const MatchUpdateDoubleElimination = suite(
  "Previous and next match update in double elimination stage",
);

MatchUpdateDoubleElimination.before.each(() => {
  storage.reset();
});

MatchUpdateDoubleElimination(
  "should end a match and determine next matches",
  () => {
    manager.create({
      name: "Amateur",
      tournamentId: 0,
      type: "double_elimination",
      seeding: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      settings: { seedOrdering: ["natural"], grandFinal: "simple" },
    });

    const before = storage.select<any>("match", 8); // First match of WB round 2
    assert.equal(before.opponent2.id, null);

    manager.update.match({
      id: 0, // First match of WB round 1
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    manager.update.match({
      id: 1, // Second match of WB round 1
      opponent1: { score: 13 },
      opponent2: { score: 16, result: "win" },
    });

    manager.update.match({
      id: 15, // First match of LB round 1
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 10 },
    });

    assert.equal(
      storage.select<any>("match", 8).opponent1.id, // Determined opponent for WB round 2
      storage.select<any>("match", 0).opponent1.id, // Winner of first match round 1
    );

    assert.equal(
      storage.select<any>("match", 8).opponent2.id, // Determined opponent for WB round 2
      storage.select<any>("match", 1).opponent2.id, // Winner of second match round 1
    );

    assert.equal(
      storage.select<any>("match", 15).opponent2.id, // Determined opponent for LB round 1
      storage.select<any>("match", 1).opponent1.id, // Loser of second match round 1
    );

    assert.equal(
      storage.select<any>("match", 19).opponent2.id, // Determined opponent for LB round 2
      storage.select<any>("match", 0).opponent2.id, // Loser of first match round 1
    );
  },
);

MatchUpdateDoubleElimination(
  "should propagate winner when BYE is already in next match in loser bracket",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "double_elimination",
      seeding: [1, 2, 3, null],
      settings: { grandFinal: "simple" },
    });

    manager.update.match({
      id: 1, // Second match of WB round 1
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    const loserId = storage.select<any>("match", 1).opponent2.id;
    let matchSemiLB = storage.select<any>("match", 3);

    assert.equal(matchSemiLB.opponent2.id, loserId);
    assert.equal(matchSemiLB.opponent2.result, "win");
    assert.equal(matchSemiLB.status, Status.Completed);

    assert.equal(
      storage.select<any>("match", 4).opponent2.id, // Propagated winner in LB Final because of the BYE.
      loserId,
    );

    manager.reset.matchResults(1); // Second match of WB round 1

    matchSemiLB = storage.select<any>("match", 3);
    assert.equal(matchSemiLB.opponent2.id, null);
    assert.equal(matchSemiLB.opponent2.result, undefined);
    assert.equal(matchSemiLB.status, Status.Locked);

    assert.equal(storage.select<any>("match", 4).opponent2.id, null); // Propagated winner is removed.
  },
);

MatchUpdateDoubleElimination("should determine matches in grand final", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "double_elimination",
    seeding: [1, 2, 3, 4],
    settings: { grandFinal: "double" },
  });

  manager.update.match({
    id: 0, // First match of WB round 1
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12 },
  });

  manager.update.match({
    id: 1, // Second match of WB round 1
    opponent1: { score: 13 },
    opponent2: { score: 16, result: "win" },
  });

  manager.update.match({
    id: 2, // WB Final
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 9 },
  });

  assert.equal(
    storage.select<any>("match", 5).opponent1.id, // Determined opponent for the grand final (round 1)
    storage.select<any>("match", 0).opponent1.id, // Winner of WB Final
  );

  manager.update.match({
    id: 3, // Only match of LB round 1
    opponent1: { score: 12, result: "win" }, // Team 4
    opponent2: { score: 8 },
  });

  manager.update.match({
    id: 4, // LB Final
    opponent1: { score: 14, result: "win" }, // Team 3
    opponent2: { score: 7 },
  });

  assert.equal(
    storage.select<any>("match", 5).opponent2.id, // Determined opponent for the grand final (round 1)
    storage.select<any>("match", 1).opponent2.id, // Winner of LB Final
  );

  manager.update.match({
    id: 5, // Grand Final round 1
    opponent1: { score: 10 },
    opponent2: { score: 16, result: "win" }, // Team 3
  });

  assert.equal(
    storage.select<any>("match", 6).opponent2.id, // Determined opponent for the grand final (round 2)
    storage.select<any>("match", 1).opponent2.id, // Winner of LB Final
  );

  assert.equal(storage.select<any>("match", 5).status, Status.Completed); // Grand final (round 1)
  assert.equal(storage.select<any>("match", 6).status, Status.Ready); // Grand final (round 2)

  manager.update.match({
    id: 6, // Grand Final round 2
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 10 },
  });
});

MatchUpdateDoubleElimination(
  "should determine next matches and reset them",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "double_elimination",
      seeding: [1, 2, 3, 4],
      settings: { grandFinal: "double" },
    });

    manager.update.match({
      id: 0, // First match of WB round 1
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    const beforeReset = storage.select<any>("match", 3); // Determined opponent for LB round 1
    assert.equal(
      beforeReset.opponent1.id,
      storage.select<any>("match", 0).opponent2.id,
    );
    assert.equal(beforeReset.opponent1.position, 1); // Must be set.

    manager.reset.matchResults(0); // First match of WB round 1

    const afterReset = storage.select<any>("match", 3); // Determined opponent for LB round 1
    assert.equal(afterReset.opponent1.id, null);
    assert.equal(afterReset.opponent1.position, 1); // It must stay.
  },
);

MatchUpdateDoubleElimination(
  "should choose the correct previous and next matches based on losers ordering",
  () => {
    manager.create({
      name: "Amateur",
      tournamentId: 0,
      type: "double_elimination",
      seeding: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      settings: {
        seedOrdering: ["natural", "reverse", "reverse"],
        grandFinal: "simple",
      },
    });

    manager.update.match({ id: 0, opponent1: { result: "win" } }); // WB 1.1
    assert.equal(
      storage.select<any>("match", 18).opponent2.id, // Determined opponent for last match of LB round 1 (reverse ordering for losers)
      storage.select<any>("match", 0).opponent2.id, // Loser of first match round 1
    );

    manager.update.match({ id: 1, opponent1: { result: "win" } }); // WB 1.2
    assert.equal(
      storage.select<any>("match", 18).opponent1.id, // Determined opponent for last match of LB round 1 (reverse ordering for losers)
      storage.select<any>("match", 1).opponent2.id, // Loser of second match round 1
    );

    manager.update.match({ id: 8, opponent1: { result: "win" } }); // WB 2.1
    assert.equal(
      storage.select<any>("match", 22).opponent1.id, // Determined opponent for last match of LB round 2 (reverse ordering for losers)
      storage.select<any>("match", 8).opponent2.id, // Loser of first match round 2
    );

    manager.update.match({ id: 6, opponent1: { result: "win" } }); // WB 1.7
    manager.update.match({ id: 7, opponent1: { result: "win" } }); // WB 1.8
    manager.update.match({ id: 11, opponent1: { result: "win" } }); // WB 2.4
    manager.update.match({ id: 15, opponent1: { result: "win" } }); // LB 1.1
    manager.update.match({ id: 19, opponent1: { result: "win" } }); // LB 2.1

    assert.equal(storage.select<any>("match", 8).status, Status.Completed); // WB 2.1
  },
);

MatchUpdateDoubleElimination(
  "should send the losers to the right LB matches in round 1",
  () => {
    manager.create({
      name: "Example with inner_outer loser ordering",
      tournamentId: 0,
      type: "double_elimination",
      seeding: [1, 2, 3, 4, 5, 6, 7, 8],
      settings: {
        seedOrdering: ["inner_outer", "inner_outer"],
      },
    });

    assert.equal(storage.select<any>("match", 7).opponent1.position, 1);
    assert.equal(storage.select<any>("match", 7).opponent2.position, 4);
    assert.equal(storage.select<any>("match", 8).opponent1.position, 2);
    assert.equal(storage.select<any>("match", 8).opponent2.position, 3);

    // Match of position 1.
    manager.update.match({
      id: 0,
      opponent1: { result: "win" }, // Loser id: 7.
    });

    assert.equal(storage.select<any>("match", 7).opponent1.id, 8);

    // Match of position 2.
    manager.update.match({
      id: 1,
      opponent1: { result: "win" }, // Loser id: 4.
    });

    assert.equal(storage.select<any>("match", 8).opponent1.id, 5);

    // Match of position 3.
    manager.update.match({
      id: 2,
      opponent1: { result: "win" }, // Loser id: 6.
    });

    assert.equal(storage.select<any>("match", 8).opponent2.id, 7);

    // Match of position 4.
    manager.update.match({
      id: 3,
      opponent1: { result: "win" }, // Loser id: 5.
    });

    assert.equal(storage.select<any>("match", 7).opponent2.id, 6);
  },
);

const SkipFirstRoundDoubleElimination = suite("Skip first round");

SkipFirstRoundDoubleElimination.before.each(() => {
  storage.reset();

  manager.create({
    name: "Example with double grand final",
    tournamentId: 0,
    type: "double_elimination",
    seeding: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    settings: {
      seedOrdering: ["natural"],
      skipFirstRound: true,
      grandFinal: "double",
    },
  });
});

SkipFirstRoundDoubleElimination(
  "should create a double elimination stage with skip first round option",
  () => {
    assert.equal(storage.select<any>("group")!.length, 3);
    assert.equal(storage.select<any>("round")!.length, 3 + 6 + 2); // One round less in WB.
    assert.equal(
      storage.select<any>("match")!.length,
      4 + 2 + 1 + (4 + 4 + 2 + 2 + 1 + 1) + (1 + 1),
    );

    assert.equal(storage.select<any>("round", 0).number, 1); // Even though the "real" first round is skipped, the stored first round's number should be 1.

    assert.equal(storage.select<any>("match", 0).opponent1.id, 1); // First match of WB.
    assert.equal(storage.select<any>("match", 7).opponent1.id, 2); // First match of LB.
  },
);

SkipFirstRoundDoubleElimination(
  "should choose the correct previous and next matches",
  () => {
    manager.update.match({ id: 0, opponent1: { result: "win" } });
    assert.equal(storage.select<any>("match", 7).opponent1.id, 2); // First match of LB Round 1 (must stay).
    assert.equal(storage.select<any>("match", 12).opponent1.id, 3); // First match of LB Round 2 (must be updated).

    manager.update.match({ id: 1, opponent1: { result: "win" } });
    assert.equal(storage.select<any>("match", 7).opponent2.id, 4); // First match of LB Round 1 (must stay).
    assert.equal(storage.select<any>("match", 11).opponent1.id, 7); // Second match of LB Round 2 (must be updated).

    manager.update.match({ id: 4, opponent1: { result: "win" } }); // First match of WB Round 2.
    assert.equal(storage.select<any>("match", 18).opponent1.id, 5); // First match of LB Round 4.

    manager.update.match({ id: 7, opponent1: { result: "win" } }); // First match of LB Round 1.
    assert.equal(storage.select<any>("match", 11).opponent2.id, 2); // First match of LB Round 2.

    for (let i = 2; i < 21; i++)
      manager.update.match({ id: i, opponent1: { result: "win" } });

    assert.equal(storage.select<any>("match", 15).opponent1.id, 7); // First match of LB Round 3.

    assert.equal(storage.select<any>("match", 21).opponent1.id, 1); // GF Round 1.
    assert.equal(storage.select<any>("match", 21).opponent2.id, 9); // GF Round 1.

    manager.update.match({ id: 21, opponent2: { result: "win" } });

    assert.equal(storage.select<any>("match", 21).opponent1.id, 1); // GF Round 2.
    assert.equal(storage.select<any>("match", 22).opponent2.id, 9); // GF Round 2.

    manager.update.match({ id: 22, opponent2: { result: "win" } });
  },
);

CreateDoubleElimination.run();
MatchUpdateDoubleElimination.run();
SkipFirstRoundDoubleElimination.run();
