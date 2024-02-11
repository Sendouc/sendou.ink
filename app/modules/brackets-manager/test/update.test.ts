import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Status } from "~/db/types";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const example = {
  name: "Amateur",
  tournamentId: 0,
  type: "double_elimination",
  seeding: [
    "Team 1",
    "Team 2",
    "Team 3",
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    "Team 8",
    "Team 9",
    "Team 10",
    "Team 11",
    "Team 12",
    "Team 13",
    "Team 14",
    "Team 15",
    "Team 16",
  ],
  settings: { seedOrdering: ["natural"] },
} as any;

const UpdateMatches = suite("Update matches");

UpdateMatches.before.each(() => {
  storage.reset();
  manager.create(example);
});

UpdateMatches("should start a match", () => {
  const before = storage.select<any>("match", 0);
  assert.equal(before.status, Status.Ready);

  manager.update.match({
    id: 0,
    opponent1: { score: 0 },
    opponent2: { score: 0 },
  });

  const after = storage.select<any>("match", 0);
  assert.equal(after.status, Status.Running);
});

UpdateMatches(
  "should update the scores for a match and set it to running",
  () => {
    manager.update.match({
      id: 0,
      opponent1: { score: 2 },
      opponent2: { score: 1 },
    });

    const after = storage.select<any>("match", 0);
    assert.equal(after.status, Status.Running);
    assert.equal(after.opponent1.score, 2);

    // Name should stay. It shouldn't be overwritten.
    assert.equal(after.opponent1.id, 0);
  },
);

UpdateMatches("should end the match by only setting the winner", () => {
  const before = storage.select<any>("match", 0);
  assert.not.ok(before.opponent1.result);

  manager.update.match({
    id: 0,
    opponent1: { result: "win" },
  });

  const after = storage.select<any>("match", 0);
  assert.equal(after.status, Status.Completed);
  assert.equal(after.opponent1.result, "win");
  assert.equal(after.opponent2.result, "loss");
});

UpdateMatches(
  "should change the winner of the match and update in the next match",
  () => {
    manager.update.match({
      id: 0,
      opponent1: { result: "win" },
    });

    assert.equal(storage.select<any>("match", 8).opponent1.id, 0);

    manager.update.match({
      id: 0,
      opponent2: { result: "win" },
    });

    const after = storage.select<any>("match", 0);
    assert.equal(after.status, Status.Completed);
    assert.equal(after.opponent1.result, "loss");
    assert.equal(after.opponent2.result, "win");

    const nextMatch = storage.select<any>("match", 8);
    assert.equal(nextMatch.status, Status.Waiting);
    assert.equal(nextMatch.opponent1.id, 1);
  },
);

UpdateMatches("should update the status of the next match", () => {
  manager.update.match({
    id: 0,
    opponent1: { result: "win" },
  });

  assert.equal(storage.select<any>("match", 8).status, Status.Waiting);

  manager.update.match({
    id: 1,
    opponent1: { result: "win" },
  });

  assert.equal(storage.select<any>("match", 8).status, Status.Ready);
});

UpdateMatches("should end the match by setting winner and loser", () => {
  manager.update.match({
    id: 0,
    status: Status.Running,
  });

  manager.update.match({
    id: 0,
    opponent1: { result: "win" },
    opponent2: { result: "loss" },
  });

  const after = storage.select<any>("match", 0);
  assert.equal(after.status, Status.Completed);
  assert.equal(after.opponent1.result, "win");
  assert.equal(after.opponent2.result, "loss");
});

UpdateMatches("should remove results from a match without score", () => {
  manager.update.match({
    id: 0,
    opponent1: { result: "win" },
    opponent2: { result: "loss" },
  });

  manager.reset.matchResults(0);

  const after = storage.select<any>("match", 0);
  assert.equal(after.status, Status.Ready);
  assert.not.ok(after.opponent1.result);
  assert.not.ok(after.opponent2.result);
});

UpdateMatches("should remove results from a match with score", () => {
  manager.update.match({
    id: 0,
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12, result: "loss" },
  });

  manager.reset.matchResults(0);

  const after = storage.select<any>("match", 0);
  assert.equal(after.status, Status.Running);
  assert.not.ok(after.opponent1.result);
  assert.not.ok(after.opponent2.result);
});

UpdateMatches("should not set the other score to 0 if only one given", () => {
  // It shouldn't be our decision to set the other score to 0.

  manager.update.match({
    id: 1,
    opponent1: { score: 1 },
  });

  const after = storage.select<any>("match", 1);
  assert.equal(after.status, Status.Running);
  assert.equal(after.opponent1.score, 1);
  assert.not.ok(after.opponent2.score);
});

UpdateMatches(
  "should end the match by setting the winner and the scores",
  () => {
    manager.update.match({
      id: 1,
      opponent1: { score: 6 },
      opponent2: { result: "win", score: 3 },
    });

    const after = storage.select<any>("match", 1);
    assert.equal(after.status, Status.Completed);

    assert.equal(after.opponent1.result, "loss");
    assert.equal(after.opponent1.score, 6);

    assert.equal(after.opponent2.result, "win");
    assert.equal(after.opponent2.score, 3);
  },
);

UpdateMatches("should throw if two winners", () => {
  assert.throws(
    () =>
      manager.update.match({
        id: 3,
        opponent1: { result: "win" },
        opponent2: { result: "win" },
      }),
    "There are two winners.",
  );

  assert.throws(
    () =>
      manager.update.match({
        id: 3,
        opponent1: { result: "loss" },
        opponent2: { result: "loss" },
      }),
    "There are two losers.",
  );
});

const GiveOpponentIds = suite("Give opponent IDs when updating");

GiveOpponentIds.before.each(() => {
  storage.reset();

  manager.create({
    name: "Amateur",
    tournamentId: 0,
    type: "double_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: { seedOrdering: ["natural"] },
  });
});

GiveOpponentIds("should update the right opponents based on their IDs", () => {
  manager.update.match({
    id: 0,
    opponent1: {
      id: 1,
      score: 10,
    },
    opponent2: {
      id: 0,
      score: 5,
    },
  });

  // Actual results must be inverted.
  const after = storage.select<any>("match", 0);
  assert.equal(after.opponent1.score, 5);
  assert.equal(after.opponent2.score, 10);
});

GiveOpponentIds(
  "should update the right opponent based on its ID, the other one is the remaining one",
  () => {
    manager.update.match({
      id: 0,
      opponent1: {
        id: 1,
        score: 10,
      },
    });

    // Actual results must be inverted.
    const after = storage.select<any>("match", 0);
    assert.not.ok(after.opponent1.score);
    assert.equal(after.opponent2.score, 10);
  },
);

GiveOpponentIds(
  "should throw when the given opponent ID does not exist in the match",
  () => {
    assert.throws(
      () =>
        manager.update.match({
          id: 0,
          opponent1: {
            id: 2, // Belongs to match id 1.
            score: 10,
          },
        }),
      /The given opponent[12] ID does not exist in this match./,
    );
  },
);

const LockedMatches = suite("Locked matches");

LockedMatches.before.each(() => {
  storage.reset();
  manager.create(example);
});

LockedMatches(
  "should throw when the matches leading to the match have not been completed yet",
  () => {
    manager.update.match({ id: 0 }); // No problem when no previous match.
    assert.throws(
      () => manager.update.match({ id: 8 }),
      "The match is locked.",
    ); // First match of WB Round 2.
    assert.throws(
      () => manager.update.match({ id: 15 }),
      "The match is locked.",
    ); // First match of LB Round 1.
    assert.throws(
      () => manager.update.match({ id: 19 }),
      "The match is locked.",
    ); // First match of LB Round 1.
    assert.throws(
      () => manager.update.match({ id: 23 }),
      "The match is locked.",
    ); // First match of LB Round 3.
  },
);

const Seeding = suite("Seeding");

Seeding.before.each(() => {
  storage.reset();

  manager.create({
    name: "Without participants",
    tournamentId: 0,
    type: "double_elimination",
    settings: {
      size: 8,
      seedOrdering: ["natural"],
    },
  });
});

Seeding("should update the seeding in a stage without any participant", () => {
  manager.update.seeding(0, [
    "Team 1",
    "Team 2",
    "Team 3",
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    "Team 8",
  ]);

  assert.equal(storage.select<any>("match", 0).opponent1.id, 0);
  assert.equal(storage.select<any>("participant")!.length, 8);
});

Seeding("should update the seeding to remove participants", () => {
  manager.update.seeding(0, [
    "Team 1",
    "Team 2",
    null,
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    null,
  ]);

  assert.equal(storage.select<any>("match", 0).opponent1.id, 0);

  // In this context, a `null` value is not a BYE, but a TDB (to be determined)
  // because we consider the tournament might have been started.
  // If it's not and you prefer BYEs, just recreate the tournament.
  assert.equal(storage.select<any>("match", 1).opponent1.id, null);
  assert.equal(storage.select<any>("match", 3).opponent2.id, null);
});

Seeding("should handle incomplete seeding during seeding update", () => {
  manager.update.seeding(0, ["Team 1", "Team 2"]);

  assert.equal(storage.select<any>("match", 0).opponent1.id, 0);
  assert.equal(storage.select<any>("match", 0).opponent2.id, 1);

  // Same here, see comments above.
  assert.equal(storage.select<any>("match", 1).opponent1.id, null);
  assert.equal(storage.select<any>("match", 1).opponent2.id, null);
});

Seeding("should update BYE to TBD during seeding update", () => {
  storage.reset();

  manager.create({
    name: "With participants and BYEs",
    tournamentId: 0,
    type: "double_elimination",
    seeding: [
      null,
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ],
    settings: {
      seedOrdering: ["natural"],
    },
  });

  assert.equal(storage.select<any>("match", 0).opponent1, null);

  manager.update.seeding(0, [
    null,
    "Team 2",
    "Team 3",
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    "Team 8",
  ]);

  // To stay consistent with the fact that `update.seeding()` uses TBD and not BYE,
  // the BYE should be updated to TDB here.
  assert.equal(storage.select<any>("match", 0).opponent1.id, null);
});

Seeding("should reset the seeding of a stage", () => {
  manager.update.seeding(0, [
    "Team 1",
    "Team 2",
    "Team 3",
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    "Team 8",
  ]);

  manager.reset.seeding(0);

  assert.equal(storage.select<any>("match", 0).opponent1.id, null);
  assert.equal(storage.select<any>("participant")!.length, 8); // Participants aren't removed.
});

Seeding(
  "should update the seeding in a stage with participants already",
  () => {
    manager.update.seeding(0, [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ]);

    manager.update.seeding(0, [
      "Team A",
      "Team B",
      "Team C",
      "Team D",
      "Team E",
      "Team F",
      "Team G",
      "Team H",
    ]);

    assert.equal(storage.select<any>("match", 0).opponent1.id, 8);
    assert.equal(storage.select<any>("participant")!.length, 16);
  },
);

Seeding(
  "should update the seeding in a stage by registering only one missing participant",
  () => {
    manager.update.seeding(0, [
      "Team A",
      "Team B",
      "Team C",
      "Team D",
      "Team E",
      "Team F",
      "Team G",
      "Team H",
    ]);

    manager.update.seeding(0, [
      "Team A",
      "Team B", // Match 0.
      "Team C",
      "Team D", // Match 1.
      "Team E",
      "Team F", // Match 2.
      "Team G",
      "Team Z", // Match 3.
    ]);

    assert.equal(storage.select<any>("match", 0).opponent1.id, 0);
    assert.equal(storage.select<any>("match", 3).opponent2.id, 8);
    assert.equal(storage.select<any>("participant")!.length, 9);
  },
);

Seeding("should update the seeding in a stage on non-locked matches", () => {
  manager.update.seeding(0, [
    "Team 1",
    "Team 2",
    "Team 3",
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    "Team 8",
  ]);

  manager.update.match({
    id: 2, // Any match id.
    opponent1: { score: 1 },
    opponent2: { score: 0 },
  });

  manager.update.seeding(0, [
    "Team A",
    "Team B", // Match 0.
    "Team C",
    "Team D", // Match 1.
    "Team 5",
    "Team 6", // Match 2. NO CHANGE.
    "Team G",
    "Team H", // Match 3.
  ]);

  assert.equal(storage.select<any>("match", 0).opponent1.id, 8); // New id.
  assert.equal(storage.select<any>("match", 2).opponent1.id, 4); // Still old id.
  assert.equal(storage.select<any>("participant")!.length, 8 + 6);
});

Seeding(
  "should update the seeding and keep completed matches completed",
  () => {
    manager.update.seeding(0, [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ]);

    manager.update.match({
      id: 0,
      opponent1: { score: 1, result: "win" },
      opponent2: { score: 0 },
    });

    manager.update.seeding(0, [
      "Team 1",
      "Team 2", // Keep this pair.
      "Team 4",
      "Team 3",
      "Team 6",
      "Team 5",
      "Team 8",
      "Team 7",
    ]);

    const match = storage.select<any>("match", 0);
    assert.equal(match.opponent1.result, "win");
    assert.equal(match.status, Status.Completed);
  },
);

Seeding(
  "should throw if a match is completed and would have to be changed",
  () => {
    manager.update.seeding(0, [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ]);

    manager.update.match({
      id: 0,
      opponent1: { score: 1, result: "win" },
      opponent2: { score: 0 },
    });

    assert.throws(
      () =>
        manager.update.seeding(0, [
          "Team 2",
          "Team 1", // Change this pair.
          "Team 3",
          "Team 4",
          "Team 5",
          "Team 6",
          "Team 7",
          "Team 8",
        ]),
      "A match is locked.",
    );
  },
);

Seeding(
  "should throw if a match is locked and would have to be changed",
  () => {
    manager.update.seeding(0, [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ]);

    manager.update.match({
      id: 2, // Any match id.
      opponent1: { score: 1 },
      opponent2: { score: 0 },
    });

    assert.throws(
      () =>
        manager.update.seeding(0, [
          "Team A",
          "Team B", // Match 0.
          "Team C",
          "Team D", // Match 1.
          "WILL",
          "THROW", // Match 2.
          "Team G",
          "Team H", // Match 3.
        ]),
      "A match is locked.",
    );
  },
);

Seeding("should throw if the seeding has duplicate participants", () => {
  assert.throws(
    () =>
      manager.update.seeding(0, [
        "Team 1",
        "Team 1", // Duplicate
        "Team 3",
        "Team 4",
        "Team 5",
        "Team 6",
        "Team 7",
        "Team 8",
      ]),
    "The seeding has a duplicate participant.",
  );
});

Seeding("should confirm the current seeding", () => {
  manager.update.seeding(0, [
    "Team 1",
    "Team 2",
    null,
    "Team 4",
    "Team 5",
    null,
    null,
    null,
  ]);

  assert.equal(storage.select<any>("match", 1).opponent1.id, null); // First, is a TBD.
  assert.equal(storage.select<any>("match", 2).opponent2.id, null);
  assert.equal(storage.select<any>("match", 3).opponent1.id, null);
  assert.equal(storage.select<any>("match", 3).opponent2.id, null);

  manager.update.confirmSeeding(0);

  assert.equal(storage.select<any>("participant")!.length, 4);

  assert.equal(storage.select<any>("match", 1).opponent1, null); // Should become a BYE.
  assert.equal(storage.select<any>("match", 2).opponent2, null);
  assert.equal(storage.select<any>("match", 3).opponent1, null);
  assert.equal(storage.select<any>("match", 3).opponent2, null);

  assert.equal(storage.select<any>("match", 5).opponent2, null); // A BYE should be propagated here.

  assert.equal(storage.select<any>("match", 7).opponent2, null); // All of these too (in loser bracket).
  assert.equal(storage.select<any>("match", 8).opponent1, null);
  assert.equal(storage.select<any>("match", 8).opponent2, null);
  assert.equal(storage.select<any>("match", 9).opponent1, null);
  assert.equal(storage.select<any>("match", 10).opponent2, null);
});

UpdateMatches.run();
GiveOpponentIds.run();
LockedMatches.run();
Seeding.run();
