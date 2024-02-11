import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const GetFinalStandings = suite("Get final standings");

GetFinalStandings.before.each(() => {
  storage.reset();
});

GetFinalStandings(
  "should get the final standings for a single elimination stage with consolation final",
  () => {
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
      settings: { consolationFinal: true },
    });

    for (let i = 0; i < 8; i++) {
      manager.update.match({
        id: i,
        ...(i % 2 === 0
          ? { opponent1: { result: "win" } }
          : { opponent2: { result: "win" } }),
      });
    }

    const finalStandings = manager.get.finalStandings(0);

    assert.equal(finalStandings, [
      { id: 0, name: "Team 1", rank: 1 },
      { id: 5, name: "Team 6", rank: 2 },

      // The consolation final has inverted those ones (rank 3).
      { id: 1, name: "Team 2", rank: 3 },
      { id: 4, name: "Team 5", rank: 4 },

      { id: 7, name: "Team 8", rank: 5 },
      { id: 3, name: "Team 4", rank: 5 },
      { id: 6, name: "Team 7", rank: 5 },
      { id: 2, name: "Team 3", rank: 5 },
    ]);
  },
);

GetFinalStandings(
  "should get the final standings for a single elimination stage without consolation final",
  () => {
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
      settings: { consolationFinal: false },
    });

    for (let i = 0; i < 7; i++) {
      manager.update.match({
        id: i,
        ...(i % 2 === 0
          ? { opponent1: { result: "win" } }
          : { opponent2: { result: "win" } }),
      });
    }

    const finalStandings = manager.get.finalStandings(0);

    assert.equal(finalStandings, [
      { id: 0, name: "Team 1", rank: 1 },
      { id: 5, name: "Team 6", rank: 2 },

      // Here, they are not inverted (rank 3).
      { id: 4, name: "Team 5", rank: 3 },
      { id: 1, name: "Team 2", rank: 3 },

      { id: 7, name: "Team 8", rank: 4 },
      { id: 3, name: "Team 4", rank: 4 },
      { id: 6, name: "Team 7", rank: 4 },
      { id: 2, name: "Team 3", rank: 4 },
    ]);
  },
);

GetFinalStandings(
  "should get the final standings for a double elimination stage with a grand final",
  () => {
    manager.create({
      name: "Example",
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
      ],
      settings: { grandFinal: "double" },
    });

    for (let i = 0; i < 15; i++) {
      manager.update.match({
        id: i,
        ...(i % 2 === 0
          ? { opponent1: { result: "win" } }
          : { opponent2: { result: "win" } }),
      });
    }

    const finalStandings = manager.get.finalStandings(0);

    assert.equal(finalStandings, [
      { id: 0, name: "Team 1", rank: 1 },
      { id: 5, name: "Team 6", rank: 2 },
      { id: 4, name: "Team 5", rank: 3 },
      { id: 3, name: "Team 4", rank: 4 },
      { id: 1, name: "Team 2", rank: 5 },
      { id: 6, name: "Team 7", rank: 5 },
      { id: 7, name: "Team 8", rank: 6 },
      { id: 2, name: "Team 3", rank: 6 },
    ]);
  },
);

GetFinalStandings(
  "should get the final standings for a double elimination stage without a grand final",
  () => {
    manager.create({
      name: "Example",
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
      ],
      settings: { grandFinal: "none" },
    });

    for (let i = 0; i < 13; i++) {
      manager.update.match({
        id: i,
        // The parity is reversed here, just to have different results.
        ...(i % 2 === 1
          ? { opponent1: { result: "win" } }
          : { opponent2: { result: "win" } }),
      });
    }

    const finalStandings = manager.get.finalStandings(0);

    assert.equal(finalStandings, [
      { id: 6, name: "Team 7", rank: 1 },
      { id: 2, name: "Team 3", rank: 2 },
      { id: 3, name: "Team 4", rank: 3 },
      { id: 5, name: "Team 6", rank: 4 },
      { id: 0, name: "Team 1", rank: 5 },
      { id: 7, name: "Team 8", rank: 5 },
      { id: 4, name: "Team 5", rank: 6 },
      { id: 1, name: "Team 2", rank: 6 },
    ]);
  },
);

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
    seeding: ["Team 1", null, null, null, null, null, null, null],
  });

  const seeding = manager.get.seeding(0);
  assert.equal(seeding.length, 8);
});

GetSeeding(
  "should get the seeding of a round-robin stage with BYEs after update",
  () => {
    storage.reset();

    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "round_robin",
      settings: {
        groupCount: 2,
        size: 8,
      },
    });

    manager.update.seeding(0, [
      "Team 1",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);

    const seeding = manager.get.seeding(0);
    assert.equal(seeding.length, 8);
  },
);

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
    seeding: [
      "Team 1",
      null,
      "Team 3",
      "Team 4",
      "Team 5",
      null,
      null,
      "Team 8",
    ],
    settings: {
      seedOrdering: ["inner_outer"],
    },
  });

  const seeding = manager.get.seeding(0);
  assert.equal(seeding.length, 8);
  assert.equal(seeding, [
    { id: 0, position: 1 },
    null,
    { id: 1, position: 3 },
    { id: 2, position: 4 },
    { id: 3, position: 5 },
    null,
    null,
    { id: 4, position: 8 },
  ]);
});

GetFinalStandings.run();
GetSeeding.run();
