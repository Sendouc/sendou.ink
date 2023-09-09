import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";
import * as assert from "uvu/assert";
import { suite } from "uvu";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const FindSingleElimination = suite(
  "Find previous and next matches in single elimination",
);

FindSingleElimination.before.each(() => {
  storage.reset();
});

FindSingleElimination("should find previous matches", () => {
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
  });

  const beforeFirst = manager.find.previousMatches(0);
  assert.equal(beforeFirst.length, 0);

  const beforeSemi1 = manager.find.previousMatches(4);
  assert.equal(beforeSemi1.length, 2);
  assert.equal(beforeSemi1[0].id, 0);
  assert.equal(beforeSemi1[1].id, 1);

  const beforeSemi2 = manager.find.previousMatches(5);
  assert.equal(beforeSemi2.length, 2);
  assert.equal(beforeSemi2[0].id, 2);
  assert.equal(beforeSemi2[1].id, 3);

  const beforeFinal = manager.find.previousMatches(6);
  assert.equal(beforeFinal.length, 2);
  assert.equal(beforeFinal[0].id, 4);
  assert.equal(beforeFinal[1].id, 5);
});

FindSingleElimination("should find next matches", () => {
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
  });

  const afterFirst = manager.find.nextMatches(0);
  assert.equal(afterFirst.length, 1);
  assert.equal(afterFirst[0].id, 4);

  const afterSemi1 = manager.find.nextMatches(4);
  assert.equal(afterSemi1.length, 1);
  assert.equal(afterSemi1[0].id, 6);

  const afterFinal = manager.find.nextMatches(6);
  assert.equal(afterFinal.length, 0);
});

FindSingleElimination(
  "should return matches from the point of view of a participant",
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
      settings: {
        seedOrdering: ["natural"],
      },
    });

    manager.update.match({ id: 0, opponent1: { result: "loss" } });
    const afterFirstEliminated = manager.find.nextMatches(0, 0);
    assert.equal(afterFirstEliminated.length, 0);
    const afterFirstContinued = manager.find.nextMatches(0, 1);
    assert.equal(afterFirstContinued.length, 1);

    manager.update.match({ id: 1, opponent1: { result: "win" } });
    const beforeSemi1Up = manager.find.previousMatches(4, 1);
    assert.equal(beforeSemi1Up.length, 1);
    assert.equal(beforeSemi1Up[0].id, 0);

    const beforeSemi1Down = manager.find.previousMatches(4, 2);
    assert.equal(beforeSemi1Down.length, 1);
    assert.equal(beforeSemi1Down[0].id, 1);
  },
);

const FindDoubleElimination = suite(
  "Find previous and next matches in double elimination",
);

FindDoubleElimination.before.each(() => {
  storage.reset();
});

FindDoubleElimination("should find previous matches", () => {
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
  });

  const beforeFirstWB = manager.find.previousMatches(0);
  assert.equal(beforeFirstWB.length, 0);

  const beforeSemi1WB = manager.find.previousMatches(4);
  assert.equal(beforeSemi1WB.length, 2);
  assert.equal(beforeSemi1WB[0].id, 0);
  assert.equal(beforeSemi1WB[1].id, 1);

  const beforeSemi2WB = manager.find.previousMatches(5);
  assert.equal(beforeSemi2WB.length, 2);
  assert.equal(beforeSemi2WB[0].id, 2);
  assert.equal(beforeSemi2WB[1].id, 3);

  const beforeFinalWB = manager.find.previousMatches(6);
  assert.equal(beforeFinalWB.length, 2);
  assert.equal(beforeFinalWB[0].id, 4);
  assert.equal(beforeFinalWB[1].id, 5);

  const beforeFirstRound1LB = manager.find.previousMatches(7);
  assert.equal(beforeFirstRound1LB.length, 2);
  assert.equal(beforeFirstRound1LB[0].id, 0);
  assert.equal(beforeFirstRound1LB[1].id, 1);

  const beforeFirstRound2LB = manager.find.previousMatches(9);
  assert.equal(beforeFirstRound2LB.length, 2);
  assert.equal(beforeFirstRound2LB[0].id, 5);
  assert.equal(beforeFirstRound2LB[1].id, 7);

  const beforeSemi1LB = manager.find.previousMatches(11);
  assert.equal(beforeSemi1LB.length, 2);
  assert.equal(beforeSemi1LB[0].id, 9);
  assert.equal(beforeSemi1LB[1].id, 10);

  const beforeFinalLB = manager.find.previousMatches(12);
  assert.equal(beforeFinalLB.length, 2);
  assert.equal(beforeFinalLB[0].id, 6);
  assert.equal(beforeFinalLB[1].id, 11);
});

FindDoubleElimination("should find next matches", () => {
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
  });

  const afterFirstWB = manager.find.nextMatches(0);
  assert.equal(afterFirstWB.length, 2);
  assert.equal(afterFirstWB[0].id, 4);
  assert.equal(afterFirstWB[1].id, 7);

  const afterSemi1WB = manager.find.nextMatches(4);
  assert.equal(afterSemi1WB.length, 2);
  assert.equal(afterSemi1WB[0].id, 6);
  assert.equal(afterSemi1WB[1].id, 10);

  const afterFinalWB = manager.find.nextMatches(6);
  assert.equal(afterFinalWB.length, 1);
  assert.equal(afterFinalWB[0].id, 12);

  const afterFirstRound1LB = manager.find.nextMatches(7);
  assert.equal(afterFirstRound1LB.length, 1);
  assert.equal(afterFirstRound1LB[0].id, 9);

  const afterFirstRound2LB = manager.find.nextMatches(9);
  assert.equal(afterFirstRound2LB.length, 1);
  assert.equal(afterFirstRound2LB[0].id, 11);

  const afterSemi1LB = manager.find.nextMatches(11);
  assert.equal(afterSemi1LB.length, 1);
  assert.equal(afterSemi1LB[0].id, 12);

  const afterFinalLB = manager.find.nextMatches(12);
  assert.equal(afterFinalLB.length, 0);
});

FindDoubleElimination(
  "should return matches from the point of view of a participant",
  () => {
    manager.create({
      name: "Example",
      tournamentId: 0,
      type: "double_elimination",
      seeding: ["Team 1", "Team 2", "Team 3", "Team 4"],
      settings: {
        seedOrdering: ["natural"],
      },
    });

    manager.update.match({ id: 0, opponent1: { result: "loss" } });
    const afterFirstEliminated = manager.find.nextMatches(0, 0);
    assert.equal(afterFirstEliminated.length, 1);
    assert.equal(afterFirstEliminated[0].id, 3);
    const afterFirstContinued = manager.find.nextMatches(0, 1);
    assert.equal(afterFirstContinued.length, 1);
    assert.equal(afterFirstContinued[0].id, 2);

    manager.update.match({ id: 1, opponent1: { result: "win" } });
    const beforeSemi1Up = manager.find.previousMatches(2, 1);
    assert.equal(beforeSemi1Up.length, 1);
    assert.equal(beforeSemi1Up[0].id, 0);

    const beforeSemi1Down = manager.find.previousMatches(2, 2);
    assert.equal(beforeSemi1Down.length, 1);
    assert.equal(beforeSemi1Down[0].id, 1);

    manager.update.match({ id: 3, opponent1: { result: "loss" } });
    const afterLowerBracketEliminated = manager.find.nextMatches(3, 0);
    assert.equal(afterLowerBracketEliminated.length, 0);
    const afterLowerBracketContinued = manager.find.nextMatches(3, 3);
    assert.equal(afterLowerBracketContinued.length, 1);
    assert.equal(afterLowerBracketContinued[0].id, 4);

    assert.throws(
      () => manager.find.nextMatches(3, 42),
      "The participant does not belong to this match.",
    );
  },
);

FindSingleElimination.run();
FindDoubleElimination.run();
