import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const DeleteStage = suite("Delete stage");

DeleteStage.before.each(() => {
  storage.reset();
});

DeleteStage("should delete a stage and all its linked data", () => {
  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [1, 2, 3, 4],
  });

  manager.delete.stage(0);

  const stages = storage.select("stage")!;
  const groups = storage.select("group")!;
  const rounds = storage.select("round")!;
  const matches = storage.select<any>("match")!;

  assert.equal(stages.length, 0);
  assert.equal(groups.length, 0);
  assert.equal(rounds.length, 0);
  assert.equal(matches.length, 0);
});

DeleteStage("should delete one stage and only its linked data", () => {
  manager.create({
    name: "Example 1",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [1, 2, 3, 4],
  });

  manager.create({
    name: "Example 2",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [1, 2, 3, 4],
  });

  manager.delete.stage(0);

  const stages = storage.select<any>("stage")!;
  const groups = storage.select<any>("group")!;
  const rounds = storage.select<any>("round")!;
  const matches = storage.select<any>("match")!;

  assert.equal(stages.length, 1);
  assert.equal(groups.length, 1);
  assert.equal(rounds.length, 2);
  assert.equal(matches.length, 3);

  // Remaining data
  assert.equal(stages[0].id, 1);
  assert.equal(groups[0].id, 1);
  assert.equal(rounds[0].id, 2);
  assert.equal(matches[0].id, 3);
});

DeleteStage("should delete all stages of the tournament", () => {
  manager.create({
    name: "Example 1",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [1, 2, 3, 4],
  });

  manager.create({
    name: "Example 2",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [1, 2, 3, 4],
  });

  manager.delete.tournament(0);

  const stages = storage.select("stage")!;
  const groups = storage.select("group")!;
  const rounds = storage.select("round")!;
  const matches = storage.select<any>("match")!;

  assert.equal(stages.length, 0);
  assert.equal(groups.length, 0);
  assert.equal(rounds.length, 0);
  assert.equal(matches.length, 0);
});

DeleteStage.run();
