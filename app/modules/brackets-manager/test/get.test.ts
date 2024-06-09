import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const GetSeeding = suite("Get seeding");

GetSeeding("should get the seeding of a round-robin stage", () => {
  storage.reset();

  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "round_robin",
    settings: {
      groupCount: 8,
      size: 32,
      seedOrdering: ["groups.seed_optimized"],
    },
  });

  const seeding = manager.get.seeding(0);
  assert.equal(seeding.length, 32);
  assert.equal(seeding[0]!.position, 1);
  assert.equal(seeding[1]!.position, 2);
});

GetSeeding("should get the seeding of a round-robin stage with BYEs", () => {
  storage.reset();

  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "round_robin",
    settings: {
      groupCount: 2,
      size: 8,
    },
    seeding: [1, null, null, null, null, null, null, null],
  });

  const seeding = manager.get.seeding(0);
  assert.equal(seeding.length, 8);
});

GetSeeding("should get the seeding of a single elimination stage", () => {
  storage.reset();

  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    settings: { size: 16 },
  });

  const seeding = manager.get.seeding(0);
  assert.equal(seeding.length, 16);
  assert.equal(seeding[0]!.position, 1);
  assert.equal(seeding[1]!.position, 2);
});

GetSeeding("should get the seeding with BYEs", () => {
  storage.reset();

  manager.create({
    name: "Example",
    tournamentId: 0,
    type: "single_elimination",
    seeding: [1, null, 2, 3, 4, null, null, 5],
    settings: {
      seedOrdering: ["inner_outer"],
    },
  });

  const seeding = manager.get.seeding(0);
  assert.equal(seeding.length, 8);
  assert.equal(seeding, [
    { id: 1, position: 1 },
    null,
    { id: 2, position: 3 },
    { id: 3, position: 4 },
    { id: 4, position: 5 },
    null,
    null,
    { id: 5, position: 8 },
  ]);
});

GetSeeding.run();
