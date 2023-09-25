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

UpdateMatches("should end the match by only setting a forfeit", () => {
  const before = storage.select<any>("match", 2);
  assert.not.ok(before.opponent1.result);

  manager.update.match({
    id: 2,
    opponent1: { forfeit: true },
  });

  const after = storage.select<any>("match", 2);
  assert.equal(after.status, Status.Completed);
  assert.equal(after.opponent1.forfeit, true);
  assert.equal(after.opponent1.result, undefined);
  assert.equal(after.opponent2.result, "win");
});

UpdateMatches("should remove forfeit from a match", () => {
  manager.update.match({
    id: 2,
    opponent1: { forfeit: true },
  });

  manager.reset.matchResults(2);

  const after = storage.select<any>("match", 2);
  assert.equal(after.status, Status.Ready);
  assert.not.ok(after.opponent1.forfeit);
  assert.not.ok(after.opponent1.result);
  assert.not.ok(after.opponent2.result);
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

UpdateMatches("should throw if two forfeits", () => {
  assert.throws(
    () =>
      manager.update.match({
        id: 3,
        opponent1: { forfeit: true },
        opponent2: { forfeit: true },
      }),
    "There are two forfeits.",
  );
});

UpdateMatches(
  "should throw if one forfeit then the other without resetting the match between",
  () => {
    manager.update.match({
      id: 2,
      opponent1: { forfeit: true },
    });

    const after = storage.select<any>("match", 2);
    assert.equal(after.opponent1.forfeit, true);
    assert.not.ok(after.opponent2.forfeit);

    assert.throws(
      () =>
        manager.update.match({
          id: 2,
          opponent2: { forfeit: true },
        }),
      "Didn't throw when updating a match with second forfeit.",
    );
  },
);

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

LockedMatches(
  "should throw when one of participants already played next match",
  () => {
    manager.update.match({ id: 0, opponent1: { result: "win" } });
    manager.update.match({ id: 1, opponent1: { result: "win" } });
    manager.update.match({ id: 8, opponent1: { result: "win" } });

    assert.throws(
      () => manager.update.match({ id: 0 }),
      "The match is locked.",
    );
  },
);

const UpdateMatchGames = suite("Update match games");

UpdateMatchGames.before.each(() => {
  storage.reset();
});

UpdateMatchGames(
  "should update child games status based on the parent match status",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      settings: {
        seedOrdering: ["natural"],
        size: 4,
      },
    });

    manager.update.matchChildCount("stage", 0, 2); // Set Bo2 for all the stage.
    assert.equal(
      storage.select<any>("match", 0).status,
      storage.select<any>("match_game", 0).status,
    );

    manager.update.seeding(0, ["Team 1", "Team 2", "Team 3", "Team 4"]);
    assert.equal(
      storage.select<any>("match", 0).status,
      storage.select<any>("match_game", 0).status,
    );

    // Semi 1
    manager.update.matchGame({
      parent_id: 0,
      number: 1,
      opponent1: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 0,
      number: 2,
      opponent1: { result: "win" },
    });
    assert.equal(storage.select<any>("match", 0).status, Status.Completed);
    assert.equal(storage.select<any>("match", 0).opponent1.score, 2);
    assert.equal(storage.select<any>("match", 0).opponent2.score, 0);

    let finalMatchStatus = storage.select<any>("match", 2).status;
    assert.equal(finalMatchStatus, Status.Waiting);
    assert.equal(finalMatchStatus, storage.select<any>("match_game", 4).status);

    // Semi 2
    manager.update.matchGame({
      parent_id: 1,
      number: 1,
      opponent2: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 1,
      number: 2,
      opponent2: { result: "win" },
    });

    finalMatchStatus = storage.select<any>("match", 2).status;
    assert.equal(finalMatchStatus, Status.Ready);
    assert.equal(finalMatchStatus, storage.select<any>("match_game", 4).status);

    // Final
    manager.update.matchGame({
      parent_id: 2,
      number: 1,
      opponent1: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 2,
      number: 2,
      opponent1: { result: "win" },
    });

    finalMatchStatus = storage.select<any>("match", 2).status;
    assert.equal(finalMatchStatus, Status.Archived);
    assert.equal(finalMatchStatus, storage.select<any>("match_game", 4).status);

    const semi1Status = storage.select<any>("match", 0).status;
    assert.equal(semi1Status, Status.Archived);
    assert.equal(semi1Status, storage.select<any>("match_game", 0).status);

    const semi2Status = storage.select<any>("match", 1).status;
    assert.equal(semi2Status, Status.Archived);
    assert.equal(semi2Status, storage.select<any>("match_game", 2).status);
  },
);

UpdateMatchGames(
  "should update parent score when match game is updated",
  () => {
    manager.create({
      name: "With match games",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        matchesChildCount: 3, // Bo3.
      },
    });

    manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
    const firstChildCompleted = storage.select<any>("match", 0);
    assert.equal(firstChildCompleted.status, Status.Running);
    assert.equal(firstChildCompleted.opponent1.score, 1);
    assert.equal(firstChildCompleted.opponent2.score, 0);

    manager.update.matchGame({ id: 1, opponent1: { result: "win" } });
    const secondChildCompleted = storage.select<any>("match", 0);
    assert.equal(secondChildCompleted.status, Status.Completed);
    assert.equal(secondChildCompleted.opponent1.score, 2);
    assert.equal(secondChildCompleted.opponent2.score, 0);

    manager.reset.matchGameResults(1);
    const secondChildReset = storage.select<any>("match", 0);
    assert.equal(secondChildReset.status, Status.Running);
    assert.equal(secondChildReset.opponent1.score, 1);
    assert.equal(secondChildReset.opponent2.score, 0);
  },
);

UpdateMatchGames("should throw if trying to update a locked match game", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    settings: {
      seedOrdering: ["natural"],
      size: 4,
      matchesChildCount: 3, // Example with all Bo3 at creation time.
    },
  });

  assert.throws(
    () => manager.update.matchGame({ id: 0 }),
    "The match game is locked.",
  );

  storage.reset();

  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    settings: {
      seedOrdering: ["natural"],
      size: 4,
    },
  });

  manager.update.matchChildCount("round", 0, 3); // Example with all Bo3 after creation time.
  assert.throws(
    () => manager.update.matchGame({ id: 0 }),
    "The match game is locked.",
  );
});

UpdateMatchGames(
  "should throw if trying to update a child game of a locked match",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        seedOrdering: ["natural"],
        matchesChildCount: 3, // Bo3
      },
    });

    manager.update.matchGame({
      parent_id: 0,
      number: 1,
      opponent1: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 0,
      number: 2,
      opponent1: { result: "win" },
    });

    manager.update.matchGame({
      parent_id: 1,
      number: 1,
      opponent1: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 1,
      number: 2,
      opponent1: { result: "win" },
    });

    // Starting the next match will lock previous matches and their match games.
    manager.update.matchGame({
      parent_id: 2,
      number: 1,
      opponent1: { score: 0 },
      opponent2: { score: 0 },
    });

    assert.throws(
      () =>
        manager.update.matchGame({
          parent_id: 0,
          number: 1,
          opponent1: { result: "loss" },
        }),
      "The match game is locked.",
    );
    assert.throws(
      () =>
        manager.update.matchGame({
          parent_id: 0,
          number: 2,
          opponent1: { result: "loss" },
        }),
      "The match game is locked.",
    );
    assert.throws(
      () =>
        manager.update.matchGame({
          parent_id: 1,
          number: 1,
          opponent1: { result: "loss" },
        }),
      "The match game is locked.",
    );
    assert.throws(
      () =>
        manager.update.matchGame({
          parent_id: 1,
          number: 2,
          opponent1: { result: "loss" },
        }),
      "The match game is locked.",
    );
  },
);

UpdateMatchGames(
  "should propagate the winner of the parent match in the next match",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { seedOrdering: ["natural"] },
    });

    manager.update.matchChildCount("round", 0, 3);

    manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
    manager.update.matchGame({ id: 1, opponent1: { result: "win" } });
    manager.update.matchGame({ id: 2, opponent2: { result: "win" } });

    assert.equal(
      storage.select<any>("match", 2).opponent1.id, // Should be determined automatically.
      storage.select<any>("match", 0).opponent1.id, // Winner of the first BO3 match.
    );
  },
);

UpdateMatchGames(
  "should select a match game with its parent match id and number",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        matchesChildCount: 3,
      },
    });

    manager.update.matchGame({
      parent_id: 0,
      number: 1,
      opponent1: { result: "win" },
    });

    manager.update.matchGame({
      parent_id: 0,
      number: 2,
      opponent1: { result: "win" },
    });

    assert.equal(storage.select<any>("match", 0).opponent1.score, 2);
  },
);

UpdateMatchGames(
  "should throw if trying to reset the results of a parent match",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2"],
      settings: {
        matchesChildCount: 3,
      },
    });

    assert.throws(
      () => manager.reset.matchResults(0),
      "The parent match is controlled by its child games and its result cannot be reset.",
    );
  },
);

UpdateMatchGames(
  "should reset the results of a parent match when a child game's results are reset",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2"],
      settings: {
        matchesChildCount: 3,
      },
    });

    manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
    manager.update.matchGame({ id: 1, opponent1: { result: "win" } });
    assert.equal(storage.select<any>("match", 0).status, Status.Archived); // Completed, but single match in the stage.

    manager.reset.matchGameResults(0);
    assert.equal(storage.select<any>("match", 0).status, Status.Running);
  },
);

UpdateMatchGames("should reset the forfeit of a parent match", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2"],
    settings: {
      matchesChildCount: 3,
    },
  });

  manager.update.match({ id: 0, opponent1: { forfeit: true } });
  manager.reset.matchResults(0);
});

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

const MatchGamesStatus = suite("Match games status");

MatchGamesStatus.before.each(() => {
  storage.reset();
});

MatchGamesStatus(
  "should have all the child games to Locked when the parent match is Locked",
  () => {
    manager.create({
      tournamentId: 0,
      name: "Example",
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { matchesChildCount: 3 },
    });

    const games = storage.select<any>("match_game", { parent_id: 2 });
    assert.equal(games![0].status, Status.Locked);
    assert.equal(games![1].status, Status.Locked);
    assert.equal(games![2].status, Status.Locked);
  },
);

MatchGamesStatus("should set all the child games to Waiting", () => {
  manager.create({
    tournamentId: 0,
    name: "Example",
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: { matchesChildCount: 3 },
  });

  manager.update.matchGame({
    parent_id: 0,
    number: 1,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 0,
    number: 2,
    opponent1: { result: "win" },
  });

  const games = storage.select<any>("match_game", { parent_id: 2 });
  assert.equal(games![0].status, Status.Waiting);
  assert.equal(games![1].status, Status.Waiting);
  assert.equal(games![2].status, Status.Waiting);
});

MatchGamesStatus("should set all the child games to Ready", () => {
  manager.create({
    tournamentId: 0,
    name: "Example",
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: { matchesChildCount: 3 },
  });

  manager.update.matchGame({
    parent_id: 0,
    number: 1,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 0,
    number: 2,
    opponent1: { result: "win" },
  });

  manager.update.matchGame({
    parent_id: 1,
    number: 1,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 1,
    number: 2,
    opponent1: { result: "win" },
  });

  const games = storage.select<any>("match_game", { parent_id: 2 });
  assert.equal(games![0].status, Status.Ready);
  assert.equal(games![1].status, Status.Ready);
  assert.equal(games![2].status, Status.Ready);
});

MatchGamesStatus(
  "should set the parent match to Running when one match game starts",
  () => {
    manager.create({
      tournamentId: 0,
      name: "Example",
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { matchesChildCount: 3 },
    });

    manager.update.matchGame({
      id: 1,
      opponent1: { score: 0 },
      opponent2: { score: 0 },
    });

    const games = storage.select<any>("match_game", { parent_id: 0 });

    // Siblings are left untouched.
    assert.equal(games![0].status, Status.Ready);
    assert.equal(games![2].status, Status.Ready);

    assert.equal(games![1].status, Status.Running);
    assert.equal(storage.select<any>("match", 0).status, Status.Running);
  },
);

MatchGamesStatus(
  "should set the child game to Completed without changing the siblings or the parent match status",
  () => {
    manager.create({
      tournamentId: 0,
      name: "Example",
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { matchesChildCount: 3 },
    });

    manager.update.matchGame({ id: 1, opponent1: { result: "win" } });

    const games = storage.select<any>("match_game", { parent_id: 0 });

    // Siblings and parent match are left untouched.
    assert.equal(games![0].status, Status.Ready);
    assert.equal(games![2].status, Status.Ready);
    assert.equal(storage.select<any>("match", 0).status, Status.Running);

    assert.equal(games![1].status, Status.Completed);
  },
);

MatchGamesStatus("should set the parent match to Completed", () => {
  manager.create({
    tournamentId: 0,
    name: "Example",
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: { matchesChildCount: 3 },
  });

  manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
  manager.update.matchGame({ id: 1, opponent1: { result: "win" } });
  assert.equal(storage.select<any>("match", 0).status, Status.Completed);

  // Left untouched, can be played if we want.
  assert.equal(storage.select<any>("match_game", 2).status, Status.Ready);

  manager.update.matchGame({ id: 2, opponent1: { result: "win" } });
  assert.equal(storage.select<any>("match", 0).status, Status.Completed);
  assert.equal(storage.select<any>("match_game", 2).status, Status.Completed);
});

MatchGamesStatus(
  "should archive previous matches and their games when next match is started",
  () => {
    manager.create({
      tournamentId: 0,
      name: "Example",
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { matchesChildCount: 3 },
    });

    manager.update.matchGame({
      parent_id: 0,
      number: 1,
      opponent1: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 0,
      number: 2,
      opponent1: { result: "win" },
    });

    manager.update.matchGame({
      parent_id: 1,
      number: 1,
      opponent1: { result: "win" },
    });
    manager.update.matchGame({
      parent_id: 1,
      number: 2,
      opponent1: { result: "win" },
    });

    manager.update.matchGame({
      parent_id: 2,
      number: 1,
      opponent1: { score: 0 },
      opponent2: { score: 0 },
    });

    const firstMatchGames = storage.select<any>("match_game", {
      parent_id: 0,
    });
    assert.equal(firstMatchGames![0].status, Status.Archived);
    assert.equal(firstMatchGames![1].status, Status.Archived);
    assert.equal(firstMatchGames![2].status, Status.Archived);

    assert.equal(storage.select<any>("match", 0).status, Status.Archived);

    const secondMatchGames = storage.select<any>("match_game", {
      parent_id: 1,
    });
    assert.equal(secondMatchGames![0].status, Status.Archived);
    assert.equal(secondMatchGames![1].status, Status.Archived);
    assert.equal(secondMatchGames![2].status, Status.Archived);

    assert.equal(storage.select<any>("match", 1).status, Status.Archived);
  },
);

MatchGamesStatus(
  "should work with unique match games when controlled via the parent",
  () => {
    manager.create({
      tournamentId: 0,
      name: "Example",
      type: "double_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { matchesChildCount: 1 },
    });

    assert.equal(storage.select<any>("match_game", 2).status, Status.Locked);
    assert.equal(storage.select<any>("match_game", 3).status, Status.Locked);

    manager.update.match({
      id: 0,
      opponent1: { score: 2, result: "win" },
      opponent2: { score: 1 },
    });

    assert.equal(storage.select<any>("match_game", 2).status, Status.Waiting);
    assert.equal(storage.select<any>("match_game", 3).status, Status.Waiting);

    manager.update.match({
      id: 1,
      opponent1: { score: 1 },
      opponent2: { score: 2, result: "win" },
    });

    assert.equal(storage.select<any>("match_game", 2).status, Status.Ready);
    assert.equal(storage.select<any>("match_game", 3).status, Status.Ready);
  },
);

MatchGamesStatus(
  "should work with unique match games when controlled via the child games",
  () => {
    manager.create({
      tournamentId: 0,
      name: "Example",
      type: "double_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { matchesChildCount: 1 },
    });

    assert.equal(storage.select<any>("match_game", 2).status, Status.Locked);
    assert.equal(storage.select<any>("match_game", 3).status, Status.Locked);

    manager.update.matchGame({
      id: 0,
      opponent1: { score: 2, result: "win" },
      opponent2: { score: 1 },
    });

    assert.equal(storage.select<any>("match_game", 2).status, Status.Waiting);
    assert.equal(storage.select<any>("match_game", 3).status, Status.Waiting);

    manager.update.matchGame({
      id: 1,
      opponent1: { score: 1 },
      opponent2: { score: 2, result: "win" },
    });

    assert.equal(storage.select<any>("match_game", 2).status, Status.Ready);
    assert.equal(storage.select<any>("match_game", 3).status, Status.Ready);
  },
);

UpdateMatches.run();
GiveOpponentIds.run();
LockedMatches.run();
UpdateMatchGames.run();
Seeding.run();
MatchGamesStatus.run();
