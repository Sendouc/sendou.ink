import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Status } from "~/db/types";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const CreateSingleEliminationStage = suite("Create single elimination stage");

CreateSingleEliminationStage.before.each(() => {
  storage.reset();
});

CreateSingleEliminationStage("should create a single elimination stage", () => {
  const example = {
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

  manager.create(example);

  const stage = storage.select<any>("stage", 0);
  assert.equal(stage.name, example.name);
  assert.equal(stage.type, example.type);

  assert.equal(storage.select<any>("group")!.length, 1);
  assert.equal(storage.select<any>("round")!.length, 4);
  assert.equal(storage.select<any>("match")!.length, 15);
});

CreateSingleEliminationStage(
  "should create a single elimination stage with BYEs",
  () => {
    manager.create({
      name: "Example with BYEs",
      tournamentId: 0,
      type: "single_elimination",
      seeding: [
        "Team 1",
        null,
        "Team 3",
        "Team 4",
        null,
        null,
        "Team 7",
        "Team 8",
      ],
      settings: { seedOrdering: ["natural"] },
    });

    assert.equal(storage.select<any>("match", 4).opponent1.id, 0); // Determined because of opponent's BYE.
    assert.equal(storage.select<any>("match", 4).opponent2.id, null); // To be determined.
    assert.equal(storage.select<any>("match", 5).opponent1, null); // BYE propagated.
    assert.equal(storage.select<any>("match", 5).opponent2.id, null); // To be determined.
  },
);

CreateSingleEliminationStage(
  "should create a single elimination stage with consolation final",
  () => {
    manager.create({
      name: "Example with consolation final",
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
      settings: { consolationFinal: true, seedOrdering: ["natural"] },
    });

    assert.equal(storage.select<any>("group")!.length, 2);
    assert.equal(storage.select<any>("round")!.length, 4);
    assert.equal(storage.select<any>("match")!.length, 8);
  },
);

CreateSingleEliminationStage(
  "should create a single elimination stage with consolation final and BYEs",
  () => {
    manager.create({
      name: "Example with consolation final and BYEs",
      tournamentId: 0,
      type: "single_elimination",
      seeding: [
        null,
        null,
        null,
        "Team 4",
        "Team 5",
        "Team 6",
        "Team 7",
        "Team 8",
      ],
      settings: { consolationFinal: true, seedOrdering: ["natural"] },
    });

    assert.equal(storage.select<any>("match", 4).opponent1, null);
    assert.equal(storage.select<any>("match", 4).opponent2.id, 0);

    // Consolation final
    assert.equal(storage.select<any>("match", 7).opponent1, null);
    assert.equal(storage.select<any>("match", 7).opponent2.id, null);
  },
);

CreateSingleEliminationStage(
  "should create a single elimination stage with Bo3 matches",
  () => {
    manager.create({
      name: "Example with Bo3 matches",
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
      settings: { seedOrdering: ["natural"], matchesChildCount: 3 },
    });

    assert.equal(storage.select<any>("group")!.length, 1);
    assert.equal(storage.select<any>("round")!.length, 3);
    assert.equal(storage.select<any>("match")!.length, 7);
    assert.equal(storage.select<any>("match_game")!.length, 7 * 3);
  },
);

CreateSingleEliminationStage(
  "should determine the number property of created stages",
  () => {
    manager.create({
      name: "Stage 1",
      tournamentId: 0,
      type: "single_elimination",
      settings: { size: 2 },
    });

    assert.equal(storage.select<any>("stage", 0).number, 1);

    manager.create({
      name: "Stage 2",
      tournamentId: 0,
      type: "single_elimination",
      settings: { size: 2 },
    });

    assert.equal(storage.select<any>("stage", 1).number, 2);

    manager.delete.stage(0);

    manager.create({
      name: "Stage 3",
      tournamentId: 0,
      type: "single_elimination",
      settings: { size: 2 },
    });

    assert.equal(storage.select<any>("stage", 2).number, 3);
  },
);

CreateSingleEliminationStage(
  "should create a stage with the given number property",
  () => {
    manager.create({
      name: "Stage 1",
      tournamentId: 0,
      type: "single_elimination",
      settings: { size: 2 },
    });

    manager.create({
      name: "Stage 2",
      tournamentId: 0,
      type: "single_elimination",
      settings: { size: 2 },
    });

    manager.delete.stage(0);

    manager.create({
      name: "Stage 1 (new)",
      tournamentId: 0,
      type: "single_elimination",
      number: 1,
      settings: { size: 2 },
    });

    assert.equal(storage.select<any>("stage", 2).number, 1);
  },
);

CreateSingleEliminationStage(
  "should throw if the given number property already exists",
  () => {
    manager.create({
      name: "Stage 1",
      tournamentId: 0,
      type: "single_elimination",
      number: 1,
      settings: { size: 2 },
    });

    assert.throws(
      () =>
        manager.create({
          name: "Stage 1",
          tournamentId: 0,
          type: "single_elimination",
          number: 1, // Duplicate
          settings: { size: 2 },
        }),
      "The given stage number already exists.",
    );
  },
);

CreateSingleEliminationStage(
  "should throw if the seeding has duplicate participants",
  () => {
    assert.throws(
      () =>
        manager.create({
          name: "Example",
          tournamentId: 0,
          type: "single_elimination",
          seeding: [
            "Team 1",
            "Team 1", // Duplicate
            "Team 3",
            "Team 4",
          ],
        }),
      "The seeding has a duplicate participant.",
    );
  },
);

CreateSingleEliminationStage(
  "should throw if trying to set a draw as a result",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    });

    assert.throws(
      () =>
        manager.update.match({
          id: 0,
          opponent1: { result: "draw" },
        }),
      "Having a draw is forbidden in an elimination tournament.",
    );
  },
);

const PreviousAndNextMatchUpdate = suite("Previous and next match update");

PreviousAndNextMatchUpdate.before.each(() => {
  storage.reset();
});

PreviousAndNextMatchUpdate(
  "should determine matches in consolation final",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { consolationFinal: true },
    });

    manager.update.match({
      id: 0, // First match of round 1
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    manager.update.match({
      id: 1, // Second match of round 1
      opponent1: { score: 13 },
      opponent2: { score: 16, result: "win" },
    });

    assert.equal(
      storage.select<any>("match", 3).opponent1.id, // Determined opponent for the consolation final
      storage.select<any>("match", 0).opponent2.id, // Loser of Semi 1
    );

    assert.equal(
      storage.select<any>("match", 3).opponent2.id, // Determined opponent for the consolation final
      storage.select<any>("match", 1).opponent1.id, // Loser of Semi 2
    );

    assert.equal(storage.select<any>("match", 2).status, Status.Ready);
    assert.equal(storage.select<any>("match", 3).status, Status.Ready);
  },
);

PreviousAndNextMatchUpdate(
  "should play both the final and consolation final in parallel",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "single_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: { consolationFinal: true },
    });

    manager.update.match({
      id: 0, // First match of round 1
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 12 },
    });

    manager.update.match({
      id: 1, // Second match of round 1
      opponent1: { score: 13 },
      opponent2: { score: 16, result: "win" },
    });

    manager.update.match({
      id: 2, // Final
      opponent1: { score: 12 },
      opponent2: { score: 9 },
    });

    assert.equal(storage.select<any>("match", 2).status, Status.Running);
    assert.equal(storage.select<any>("match", 3).status, Status.Ready);

    manager.update.match({
      id: 3, // Consolation final
      opponent1: { score: 12 },
      opponent2: { score: 9 },
    });

    assert.equal(storage.select<any>("match", 2).status, Status.Running);
    assert.equal(storage.select<any>("match", 3).status, Status.Running);

    manager.update.match({
      id: 3, // Consolation final
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 9 },
    });

    assert.equal(storage.select<any>("match", 2).status, Status.Running);
    assert.equal(storage.select<any>("match", 3).status, Status.Archived);

    manager.update.match({
      id: 2, // Final
      opponent1: { score: 16, result: "win" },
      opponent2: { score: 9 },
    });

    assert.equal(storage.select<any>("match", 2).status, Status.Archived);
    assert.equal(storage.select<any>("match", 3).status, Status.Archived);
  },
);

PreviousAndNextMatchUpdate("should archive previous matches", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
    settings: { consolationFinal: true },
  });

  manager.update.match({
    id: 0, // First match of round 1
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 12 },
  });

  manager.update.match({
    id: 1, // Second match of round 1
    opponent1: { score: 13 },
    opponent2: { score: 16, result: "win" },
  });

  manager.update.match({
    id: 2, // Final
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 9 },
  });

  assert.equal(storage.select<any>("match", 0).status, Status.Archived);
  assert.equal(storage.select<any>("match", 1).status, Status.Archived);

  manager.update.match({
    id: 3, // Consolation final
    opponent1: { score: 16, result: "win" },
    opponent2: { score: 9 },
  });

  assert.equal(storage.select<any>("match", 2).status, Status.Archived); // Final
  assert.equal(storage.select<any>("match", 3).status, Status.Archived); // Consolation final
});

CreateSingleEliminationStage.run();
PreviousAndNextMatchUpdate.run();
