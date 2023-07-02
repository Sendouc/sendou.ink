import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const BYEHandling = suite("BYE handling");

BYEHandling.before.each(() => {
  storage.reset();
});

BYEHandling("should propagate BYEs through the brackets", () => {
  manager.create({
    name: "Example with BYEs",
    tournamentId: 0,
    type: "double_elimination",
    seeding: ["Team 1", null, null, null],
    settings: { seedOrdering: ["natural"], grandFinal: "simple" },
  });

  assert.equal(storage.select<any>("match", 2).opponent1.id, 0);
  assert.equal(storage.select<any>("match", 2).opponent2, null);

  assert.equal(storage.select<any>("match", 3).opponent1, null);
  assert.equal(storage.select<any>("match", 3).opponent2, null);

  assert.equal(storage.select<any>("match", 4).opponent1, null);
  assert.equal(storage.select<any>("match", 4).opponent2, null);

  assert.equal(storage.select<any>("match", 5).opponent1.id, 0);
  assert.equal(storage.select<any>("match", 5).opponent2, null);
});

BYEHandling("should handle incomplete seeding during creation", () => {
  manager.create({
    name: "Example with BYEs",
    tournamentId: 0,
    type: "double_elimination",
    seeding: ["Team 1", "Team 2"],
    settings: {
      seedOrdering: ["natural"],
      balanceByes: false, // Default value.
      size: 4,
    },
  });

  assert.equal(storage.select<any>("match", 0).opponent1.id, 0);
  assert.equal(storage.select<any>("match", 0).opponent2.id, 1);

  assert.equal(storage.select<any>("match", 1).opponent1, null);
  assert.equal(storage.select<any>("match", 1).opponent2, null);
});

BYEHandling("should balance BYEs in the seeding", () => {
  manager.create({
    name: "Example with BYEs",
    tournamentId: 0,
    type: "double_elimination",
    seeding: ["Team 1", "Team 2"],
    settings: {
      seedOrdering: ["natural"],
      balanceByes: true,
      size: 4,
    },
  });

  assert.equal(storage.select<any>("match", 0).opponent1.id, 0);
  assert.equal(storage.select<any>("match", 0).opponent2, null);

  assert.equal(storage.select<any>("match", 1).opponent1.id, 1);
  assert.equal(storage.select<any>("match", 1).opponent2, null);
});

const PositionChecks = suite("Position checks");

PositionChecks.before.each(() => {
  storage.reset();

  manager.create({
    name: "Example with double grand final",
    tournamentId: 0,
    type: "double_elimination",
    settings: {
      size: 8,
      grandFinal: "simple",
      seedOrdering: ["natural"],
    },
  });
});

PositionChecks(
  "should not have a position when we don't need the origin of a participant",
  () => {
    const matchFromWbRound2 = storage.select<any>("match", 4);
    assert.equal(matchFromWbRound2.opponent1.position, undefined);
    assert.equal(matchFromWbRound2.opponent2.position, undefined);

    const matchFromLbRound2 = storage.select<any>("match", 9);
    assert.equal(matchFromLbRound2.opponent2.position, undefined);

    const matchFromGrandFinal = storage.select<any>("match", 13);
    assert.equal(matchFromGrandFinal.opponent1.position, undefined);
  }
);

PositionChecks(
  "should have a position where we need the origin of a participant",
  () => {
    const matchFromWbRound1 = storage.select<any>("match", 0);
    assert.equal(matchFromWbRound1.opponent1.position, 1);
    assert.equal(matchFromWbRound1.opponent2.position, 2);

    const matchFromLbRound1 = storage.select<any>("match", 7);
    assert.equal(matchFromLbRound1.opponent1.position, 1);
    assert.equal(matchFromLbRound1.opponent2.position, 2);

    const matchFromLbRound2 = storage.select<any>("match", 9);
    assert.equal(matchFromLbRound2.opponent1.position, 2);

    const matchFromGrandFinal = storage.select<any>("match", 13);
    assert.equal(matchFromGrandFinal.opponent2.position, 1);
  }
);

const SpecialCases = suite("Special cases");

SpecialCases.before.each(() => {
  storage.reset();
});

SpecialCases(
  "should create a stage and add participants IDs in seeding",
  () => {
    const teams = [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ];

    const participants = teams.map((name) => ({
      tournament_id: 0,
      name,
    }));

    // Simulation of external database filling for participants.
    storage.insert("participant", participants);

    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      settings: { size: 8 },
    });

    // Update seeding with already existing IDs.
    manager.update.seeding(0, [0, 1, 2, 3, 4, 5, 6, 7]);

    assert.equal(storage.select<any>("match", 0).opponent1.id, 0);
  }
);

SpecialCases("should throw if the name of the stage is not provided", () => {
  assert.throws(
    () =>
      // @ts-expect-error testing throwing
      manager.create({
        tournamentId: 0,
        type: "single_elimination",
      }),
    "You must provide a name for the stage."
  );
});

SpecialCases(
  "should throw if the tournament id of the stage is not provided",
  () => {
    assert.throws(
      () =>
        // @ts-expect-error testing throwing
        manager.create({
          name: "Example",
          type: "single_elimination",
        }),
      "You must provide a tournament id for the stage."
    );
  }
);

SpecialCases(
  "should throw if the participant count of a stage is not a power of two",
  () => {
    assert.throws(
      () =>
        manager.create({
          name: "Example",
          tournamentId: 0,
          type: "single_elimination",
          seeding: [
            "Team 1",
            "Team 2",
            "Team 3",
            "Team 4",
            "Team 5",
            "Team 6",
            "Team 7",
          ],
        }),
      "The library only supports a participant count which is a power of two."
    );

    assert.throws(
      () =>
        manager.create({
          name: "Example",
          tournamentId: 0,
          type: "single_elimination",
          settings: { size: 3 },
        }),
      "The library only supports a participant count which is a power of two."
    );
  }
);

SpecialCases(
  "should throw if the participant count of a stage is less than two",
  () => {
    assert.throws(
      () =>
        manager.create({
          name: "Example",
          tournamentId: 0,
          type: "single_elimination",
          settings: { size: 0 },
        }),
      "Impossible to create an empty stage. If you want an empty seeding, just set the size of the stage."
    );

    assert.throws(
      () =>
        manager.create({
          name: "Example",
          tournamentId: 0,
          type: "single_elimination",
          settings: { size: 1 },
        }),
      "Impossible to create a stage with less than 2 participants."
    );
  }
);

const UpdateMatchChildCount = suite("Update match child count");

UpdateMatchChildCount.before.each(() => {
  storage.reset();

  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
      "Team 7",
      "Team 8",
    ],
    settings: { seedOrdering: ["natural"], matchesChildCount: 1 },
  });
});

UpdateMatchChildCount("should change match child count at match level", () => {
  manager.update.matchChildCount("match", 0, 3);
  assert.equal(storage.select<any>("match", 0).child_count, 3);
  assert.equal(storage.select<any>("match_game")!.length, 6 + 3);
});

UpdateMatchChildCount("should remove all child games of the match", () => {
  manager.update.matchChildCount("match", 0, 3); // Bo3
  manager.update.matchChildCount("match", 0, 0); // No child games.
  assert.equal(storage.select<any>("match", 0).child_count, 0);
  assert.equal(storage.select<any>("match_game")!.length, 6);
});

UpdateMatchChildCount("should change match child count at round level", () => {
  manager.update.matchChildCount("round", 2, 3); // Round of id 2 in Bo3
  assert.equal(storage.select<any>("match_game")!.length, 6 + 3);

  manager.update.matchChildCount("round", 1, 2); // Round of id 1 in Bo2
  assert.equal(storage.select<any>("match_game")!.length, 4 + 4 + 3);

  manager.update.matchChildCount("round", 0, 0); // Round of id 0 in Bo0 (normal matches without games)
  assert.equal(storage.select<any>("match_game")!.length, 0 + 4 + 3);
});

UpdateMatchChildCount("should change match child count at group level", () => {
  manager.update.matchChildCount("group", 0, 4);
  assert.equal(storage.select<any>("match_game")!.length, 7 * 4);

  manager.update.matchChildCount("group", 0, 2);
  assert.equal(storage.select<any>("match_game")!.length, 7 * 2);
});

UpdateMatchChildCount("should change match child count at stage level", () => {
  manager.update.matchChildCount("stage", 0, 4);
  assert.equal(storage.select<any>("match_game")!.length, 7 * 4);

  manager.update.matchChildCount("stage", 0, 2);
  assert.equal(storage.select<any>("match_game")!.length, 7 * 2);
});

const SeedingAndOrderingInElimination = suite(
  "Seeding and ordering in elimination"
);

SeedingAndOrderingInElimination.before.each(() => {
  storage.reset();

  manager.create({
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
    settings: {
      seedOrdering: [
        "inner_outer",
        "reverse",
        "pair_flip",
        "half_shift",
        "reverse",
      ],
    },
  });
});

SeedingAndOrderingInElimination(
  "should have the good orderings everywhere",
  () => {
    const firstRoundMatchWB = storage.select<any>("match", 0);
    assert.equal(firstRoundMatchWB.opponent1.position, 1);
    assert.equal(firstRoundMatchWB.opponent2.position, 16);

    const firstRoundMatchLB = storage.select<any>("match", 15);
    assert.equal(firstRoundMatchLB.opponent1.position, 8);
    assert.equal(firstRoundMatchLB.opponent2.position, 7);

    const secondRoundMatchLB = storage.select<any>("match", 19);
    assert.equal(secondRoundMatchLB.opponent1.position, 2);

    const secondRoundSecondMatchLB = storage.select<any>("match", 20);
    assert.equal(secondRoundSecondMatchLB.opponent1.position, 1);

    const fourthRoundMatchLB = storage.select<any>("match", 25);
    assert.equal(fourthRoundMatchLB.opponent1.position, 2);

    const finalRoundMatchLB = storage.select<any>("match", 28);
    assert.equal(finalRoundMatchLB.opponent1.position, 1);
  }
);

SeedingAndOrderingInElimination("should update the orderings in rounds", () => {
  let firstRoundMatchWB = storage.select<any>("match", 0);

  // Inner outer before changing.
  assert.equal(firstRoundMatchWB.opponent1.position, 1);
  assert.equal(firstRoundMatchWB.opponent2.position, 16);

  manager.update.roundOrdering(0, "pair_flip");

  firstRoundMatchWB = storage.select<any>("match", 0);

  // Should now be pair_flip.
  assert.equal(firstRoundMatchWB.opponent1.position, 2);
  assert.equal(firstRoundMatchWB.opponent2.position, 1);

  manager.update.roundOrdering(5, "reverse");

  const secondRoundMatchLB = storage.select<any>("match", 19);
  assert.equal(secondRoundMatchLB.opponent1.position, 4);

  const secondRoundSecondMatchLB = storage.select<any>("match", 20);
  assert.equal(secondRoundSecondMatchLB.opponent1.position, 3);
});

SeedingAndOrderingInElimination(
  "should throw if round does not support ordering",
  () => {
    assert.throws(
      () => manager.update.roundOrdering(6, "natural"), // LB Round 2
      "This round does not support ordering."
    );

    assert.throws(
      () => manager.update.roundOrdering(9, "natural"), // LB Round 6 (last minor round)
      "This round does not support ordering."
    );
  }
);

SeedingAndOrderingInElimination(
  "should throw if at least one match is running or completed",
  () => {
    manager.update.match({
      id: 0,
      opponent1: { score: 1 },
    });

    assert.throws(
      () => manager.update.roundOrdering(0, "natural"),
      "At least one match has started or is completed."
    );

    manager.update.match({
      id: 0,
      opponent1: { result: "win" },
    });

    assert.throws(
      () => manager.update.roundOrdering(0, "natural"),
      "At least one match has started or is completed."
    );
  }
);

SeedingAndOrderingInElimination(
  "should update all the ordering of a stage at once",
  () => {
    manager.update.ordering(0, [
      "pair_flip",
      "half_shift",
      "reverse",
      "natural",
    ]);

    const firstRoundMatchWB = storage.select<any>("match", 0);
    assert.equal(firstRoundMatchWB.opponent1.position, 2);
    assert.equal(firstRoundMatchWB.opponent2.position, 1);

    const firstRoundMatchLB = storage.select<any>("match", 15);
    assert.equal(firstRoundMatchLB.opponent1.position, 5);
    assert.equal(firstRoundMatchLB.opponent2.position, 6);

    const secondRoundMatchLB = storage.select<any>("match", 19);
    assert.equal(secondRoundMatchLB.opponent1.position, 4);

    const secondRoundSecondMatchLB = storage.select<any>("match", 20);
    assert.equal(secondRoundSecondMatchLB.opponent1.position, 3);

    const fourthRoundMatchLB = storage.select<any>("match", 25);
    assert.equal(fourthRoundMatchLB.opponent1.position, 1);

    const finalRoundMatchLB = storage.select<any>("match", 28);
    assert.equal(finalRoundMatchLB.opponent1.position, 1);
  }
);

const BestOfSeriesMatchesCompletion = suite(
  "Best-Of series matches completion"
);

BestOfSeriesMatchesCompletion.before.each(() => {
  storage.reset();
});

BestOfSeriesMatchesCompletion("should end Bo1 matches", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: {
      matchesChildCount: 1,
    },
  });

  manager.update.matchGame({ id: 0, opponent1: { result: "win" } });

  const match = storage.select<any>("match", 0);
  assert.equal(match.opponent1.score, 1);
  assert.equal(match.opponent2.score, 0);
  assert.equal(match.opponent1.result, "win");
});

BestOfSeriesMatchesCompletion(
  "should end Bo2 matches in round-robin stage",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "round_robin",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        matchesChildCount: 2, // Bo2
        groupCount: 1,
      },
    });

    manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
    manager.update.matchGame({ id: 1, opponent2: { result: "win" } });

    const match = storage.select<any>("match", 0);
    assert.equal(match.opponent1.score, 1);
    assert.equal(match.opponent2.score, 1);
    assert.equal(match.opponent1.result, "draw");
    assert.equal(match.opponent2.result, "draw");
  }
);

BestOfSeriesMatchesCompletion(
  "should throw if a BoX match has a tie in an elimination stage",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        matchesChildCount: 2, // Bo2
      },
    });

    manager.update.matchGame({ id: 0, opponent1: { result: "win" } });

    assert.throws(
      () =>
        manager.update.matchGame({
          id: 1,
          opponent2: { result: "win" },
        }),
      "Match games result in a tie for the parent match."
    );
  }
);

BestOfSeriesMatchesCompletion("should end Bo3 matches", () => {
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

  const firstMatch = storage.select<any>("match", 0);
  assert.equal(firstMatch.opponent1.score, 2);
  assert.equal(firstMatch.opponent2.score, 0);
  assert.equal(firstMatch.opponent1.result, "win");

  manager.update.matchGame({
    parent_id: 1,
    number: 1,
    opponent2: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 1,
    number: 2,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 1,
    number: 3,
    opponent1: { result: "win" },
  });

  const secondMatch = storage.select<any>("match", 1);
  assert.equal(secondMatch.opponent1.score, 2);
  assert.equal(secondMatch.opponent2.score, 1);
  assert.equal(secondMatch.opponent1.result, "win");
});

BestOfSeriesMatchesCompletion(
  "should let the last match be played even if not necessary",
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

    let match = storage.select<any>("match", 0);
    assert.equal(match.opponent1.score, 2);
    assert.equal(match.opponent2.score, 0);
    assert.equal(match.opponent1.result, "win");

    manager.update.matchGame({
      parent_id: 0,
      number: 3,
      opponent2: { result: "win" },
    });

    match = storage.select<any>("match", 0);
    assert.equal(match.opponent1.score, 2);
    assert.equal(match.opponent2.score, 1);
    assert.equal(match.opponent1.result, "win");
  }
);

BestOfSeriesMatchesCompletion("should end Bo5 matches", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: {
      matchesChildCount: 5,
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
    parent_id: 0,
    number: 3,
    opponent1: { result: "win" },
  });

  const firstMatch = storage.select<any>("match", 0);
  assert.equal(firstMatch.opponent1.score, 3);
  assert.equal(firstMatch.opponent2.score, 0);
  assert.equal(firstMatch.opponent1.result, "win");

  manager.update.matchGame({
    parent_id: 1,
    number: 1,
    opponent2: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 1,
    number: 2,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 1,
    number: 3,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 1,
    number: 4,
    opponent1: { result: "win" },
  });

  const secondMatch = storage.select<any>("match", 1);
  assert.equal(secondMatch.opponent1.score, 3);
  assert.equal(secondMatch.opponent2.score, 1);
  assert.equal(secondMatch.opponent1.result, "win");

  manager.update.matchGame({
    parent_id: 2,
    number: 1,
    opponent2: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 2,
    number: 2,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 2,
    number: 3,
    opponent1: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 2,
    number: 4,
    opponent2: { result: "win" },
  });
  manager.update.matchGame({
    parent_id: 2,
    number: 5,
    opponent1: { result: "win" },
  });

  const thirdMatch = storage.select<any>("match", 2);
  assert.equal(thirdMatch.opponent1.score, 3);
  assert.equal(thirdMatch.opponent2.score, 2);
  assert.equal(thirdMatch.opponent1.result, "win");
});

BestOfSeriesMatchesCompletion(
  "should handle match auto-win against a BYE after a BoX series",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2"],
      settings: {
        seedOrdering: ["natural"],
        matchesChildCount: 3,
        size: 8,
        consolationFinal: true,
      },
    });

    manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
    manager.update.matchGame({ id: 1, opponent1: { result: "win" } });

    assert.equal(storage.select<any>("match", 4).opponent1.result, "win");
    assert.equal(storage.select<any>("match", 6).opponent1.result, "win");
  }
);

const ResetMatchAndMatchGames = suite("Reset match and match games");

ResetMatchAndMatchGames.before.each(() => {
  storage.reset();
});

ResetMatchAndMatchGames("should reset results of a match", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2"],
    settings: {
      seedOrdering: ["natural"],
      size: 8,
    },
  });

  manager.update.match({
    id: 0,
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12 },
  });

  let match = storage.select<any>("match", 0);
  assert.equal(match.opponent1.score, 16);
  assert.equal(match.opponent2.score, 12);
  assert.equal(match.opponent1.result, "win");

  let semi1 = storage.select<any>("match", 4);
  assert.equal(semi1.opponent1.result, "win");
  assert.equal(semi1.opponent2, null);

  let final = storage.select<any>("match", 6);
  assert.equal(final.opponent1.result, "win");
  assert.equal(final.opponent2, null);

  manager.reset.matchResults(0); // Score stays as is.

  match = storage.select<any>("match", 0);
  assert.equal(match.opponent1.score, 16);
  assert.equal(match.opponent2.score, 12);
  assert.equal(match.opponent1.result, undefined);

  semi1 = storage.select<any>("match", 4);
  assert.equal(semi1.opponent1.result, undefined);
  assert.equal(semi1.opponent2, null);

  final = storage.select<any>("match", 6);
  assert.equal(final.opponent1.result, undefined);
  assert.equal(final.opponent2, null);
});

ResetMatchAndMatchGames(
  "should throw when at least one of the following match is locked",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        seedOrdering: ["natural"],
      },
    });

    manager.update.match({
      id: 0,
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    manager.update.match({
      id: 1,
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    manager.update.match({
      id: 2,
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    assert.throws(() => manager.reset.matchResults(0), "The match is locked.");
  }
);

ResetMatchAndMatchGames("should reset results of a match game", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2"],
    settings: {
      seedOrdering: ["natural"],
      matchesChildCount: 3,
      consolationFinal: true,
      size: 8,
    },
  });

  manager.update.matchGame({ id: 0, opponent1: { result: "win" } });
  manager.update.matchGame({ id: 1, opponent1: { result: "win" } });

  assert.equal(storage.select<any>("match", 4).opponent1.result, "win");
  assert.equal(storage.select<any>("match", 6).opponent1.result, "win");
  assert.equal(storage.select<any>("match", 7).opponent1, null); // BYE in consolation final.

  manager.reset.matchGameResults(1);

  assert.equal(storage.select<any>("match", 4).opponent1.result, undefined);
  assert.equal(storage.select<any>("match", 6).opponent1.result, undefined);
  assert.equal(storage.select<any>("match", 7).opponent1, null); // Still BYE in consolation final.
});

const ImportExport = suite("Import / export");

ImportExport.before.each(() => {
  storage.reset();
});

ImportExport("should import data in the storage", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: {
      seedOrdering: ["natural"],
      matchesChildCount: 1,
    },
  });

  const initialData = manager.get.stageData(0);

  manager.update.match({
    id: 0,
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12 },
  });

  manager.update.match({
    id: 1,
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12 },
  });

  manager.update.match({
    id: 2,
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12 },
  });

  assert.equal(storage.select<any>("match", 0).opponent1.result, "win");
  assert.equal(storage.select<any>("match", 1).opponent1.result, "win");

  manager.import(initialData);

  assert.equal(storage.select<any>("match", 0).opponent1.result, undefined);
  assert.equal(storage.select<any>("match", 1).opponent1.result, undefined);
});

ImportExport("should import data in the storage with normalized IDs", () => {
  storage.insert("participant", { name: "Unused team" });

  manager.create({
    name: "Example 1",
    tournamentId: 0,
    type: "round_robin",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: {
      groupCount: 1,
      matchesChildCount: 1,
    },
  });

  manager.create({
    name: "Example 2",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 5", "Team 6", "Team 7", "Team 8"],
    settings: {
      seedOrdering: ["natural"],
      matchesChildCount: 1,
    },
  });

  const initialData = manager.get.stageData(1);

  assert.equal(initialData.stage[0].id, 1);
  assert.equal(initialData.participant[0], {
    id: 1,
    tournament_id: 0,
    name: "Team 1",
  });
  assert.equal(initialData.group[0], { id: 1, stage_id: 1, number: 1 });
  assert.equal(initialData.round[0], {
    id: 3,
    stage_id: 1,
    group_id: 1,
    number: 1,
  });
  assert.equal(initialData.match[0], {
    id: 6,
    stage_id: 1,
    group_id: 1,
    round_id: 3,
    opponent1: { id: 5, position: 1 },
    opponent2: { id: 6, position: 2 },
    number: 1,
    status: 2,
    child_count: 1,
  });
  assert.equal(initialData.match_game[0], {
    id: 6,
    number: 1,
    stage_id: 1,
    parent_id: 6,
    status: 2,
    opponent1: { id: 5 },
    opponent2: { id: 6 },
  });

  manager.import(initialData, true);

  const data = manager.get.stageData(0);

  assert.equal(data.stage[0].id, 0);
  assert.equal(data.participant[0], {
    id: 0,
    tournament_id: 0,
    name: "Team 1",
  });
  assert.equal(data.group[0], { id: 0, stage_id: 0, number: 1 });
  assert.equal(data.round[0], {
    id: 0,
    stage_id: 0,
    group_id: 0,
    number: 1,
  });
  assert.equal(data.match[0], {
    id: 0,
    stage_id: 0,
    group_id: 0,
    round_id: 0,
    opponent1: { id: 4, position: 1 },
    opponent2: { id: 5, position: 2 },
    number: 1,
    status: 2,
    child_count: 1,
  });
  assert.equal(data.match_game[0], {
    id: 0,
    number: 1,
    stage_id: 0,
    parent_id: 0,
    status: 2,
    opponent1: { id: 4 },
    opponent2: { id: 5 },
  });
});

ImportExport("should export data from the storage", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: {
      seedOrdering: ["natural"],
      matchesChildCount: 2,
    },
  });

  const data = manager.export();

  for (const key of [
    "participant",
    "stage",
    "group",
    "round",
    "match",
    "match_game",
  ]) {
    assert.ok(Object.keys(data).includes(key));
  }

  assert.equal(storage.select<any>("participant"), data.participant);
  assert.equal(storage.select<any>("stage"), data.stage);
  assert.equal(storage.select<any>("group"), data.group);
  assert.equal(storage.select<any>("round"), data.round);
  assert.equal(storage.select<any>("match"), data.match);
  assert.equal(storage.select<any>("match_game"), data.match_game);
});

BYEHandling.run();
PositionChecks.run();
SpecialCases.run();
UpdateMatchChildCount.run();
SeedingAndOrderingInElimination.run();
BestOfSeriesMatchesCompletion.run();
ResetMatchAndMatchGames.run();
ImportExport.run();
