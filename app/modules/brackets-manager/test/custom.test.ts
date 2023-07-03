import * as assert from "uvu/assert";
import { BracketsManager } from "../manager";
import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { suite } from "uvu";
import type { InputStage } from "~/modules/brackets-model";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const createTournament = (tournamentType: any): InputStage => ({
  name: "Amateur",
  tournamentId: 0,
  type: tournamentType,
  seeding: [
    { name: "Team 1", nationality: "US", tournament_id: 0, id: 0 },
    { name: "Team 2", nationality: "US", tournament_id: 0, id: 1 },
    { name: "Team 3", nationality: "US", tournament_id: 0, id: 2 },
    { name: "Team 4", nationality: "US", tournament_id: 0, id: 3 },
    { name: "Team 5", nationality: "US", tournament_id: 0, id: 4 },
    { name: "Team 6", nationality: "US", tournament_id: 0, id: 5 },
    { name: "Team 7", nationality: "US", tournament_id: 0, id: 6 },
    { name: "Team 8", nationality: "US", tournament_id: 0, id: 7 },
    { name: "Team 9", nationality: "US", tournament_id: 0, id: 8 },
    { name: "Team 10", nationality: "US", tournament_id: 0, id: 9 },
    { name: "Team 11", nationality: "US", tournament_id: 0, id: 10 },
    { name: "Team 12", nationality: "US", tournament_id: 0, id: 11 },
    { name: "Team 13", nationality: "US", tournament_id: 0, id: 12 },
    { name: "Team 14", nationality: "US", tournament_id: 0, id: 13 },
    { name: "Team 15", nationality: "US", tournament_id: 0, id: 14 },
    { name: "Team 16", nationality: "US", tournament_id: 0, id: 15 },
  ],
  settings:
    tournamentType === "round_robin"
      ? { groupCount: 2 }
      : { seedOrdering: ["natural"] },
});

const CustomSeeding = suite("Create tournaments with custom seeding");

CustomSeeding.before.each(() => {
  storage.reset();
});

CustomSeeding("should create single elimination with custom seeding", () => {
  manager.create(createTournament("single_elimination"));
  const stageData = manager.get.stageData(0);
  assert.equal((stageData.participant[0] as any).nationality, "US");
  assert.equal(stageData.participant.length, 16);
});

CustomSeeding("should create double elimination with custom seeding", () => {
  manager.create(createTournament("double_elimination"));
  const stageData = manager.get.stageData(0);

  assert.equal((stageData.participant[0] as any).nationality, "US");
  assert.equal(stageData.participant.length, 16);
});

CustomSeeding("should create round robin with custom seeding", () => {
  manager.create(createTournament("round_robin"));
  const stageData = manager.get.stageData(0);

  assert.equal((stageData.participant[0] as any).nationality, "US");
  assert.equal(stageData.participant.length, 16);
});

const ExtraFields = suite("Update results with extra fields");

ExtraFields.before.each(() => {
  storage.reset();
});

ExtraFields("Extra fields when updating a match", () => {
  manager.create({
    name: "Amateur",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
  });

  manager.update.match({
    id: 0,
    // @ts-expect-error incomplete types
    weather: "rainy", // Extra field.
    opponent1: {
      score: 3,
      result: "win",
    },
    opponent2: {
      score: 1,
      result: "loss",
    },
  });

  manager.update.match({
    id: 1,
    opponent1: {
      score: 3,
      result: "win",
      // @ts-expect-error incomplete types
      foo: 42, // Extra field.
    },
    opponent2: {
      score: 1,
      result: "loss",
    },
  });

  manager.update.match({
    id: 2,
    opponent1: {
      score: 3,
      result: "win",
    },
    opponent2: {
      score: 1,
      result: "loss",
      // @ts-expect-error incomplete types
      info: { replacements: [1, 2] }, // Extra field.
    },
  });

  assert.equal(storage.select<any>("match", 0).weather, "rainy");
  assert.equal(storage.select<any>("match", 1).opponent1.foo, 42);
  assert.equal(storage.select<any>("match", 2).opponent2.info, {
    replacements: [1, 2],
  });
});

ExtraFields("Extra fields when updating a match game", () => {
  manager.create({
    name: "Amateur",
    tournamentId: 0,
    type: "single_elimination",
    seeding: ["Team 1", "Team 2"],
    settings: {
      matchesChildCount: 3,
    },
  });

  manager.update.matchGame({
    id: 0,
    // @ts-expect-error incomplete types
    weather: "rainy", // Extra field.
    opponent1: {
      score: 3,
      result: "win",
    },
    opponent2: {
      score: 1,
      result: "loss",
    },
  });

  manager.update.matchGame({
    id: 1,
    opponent1: {
      score: 3,
      result: "win",
      // @ts-expect-error incomplete types
      foo: 42, // Extra field.
    },
    opponent2: {
      score: 1,
      result: "loss",
      // @ts-expect-error incomplete types
      info: { replacements: [1, 2] }, // Extra field.
    },
  });

  assert.equal(storage.select<any>("match_game", 0).weather, "rainy");
  assert.equal(storage.select<any>("match_game", 1).opponent1.foo, 42);
  assert.equal(storage.select<any>("match_game", 1).opponent2.info, {
    replacements: [1, 2],
  });
});

CustomSeeding.run();
ExtraFields.run();
