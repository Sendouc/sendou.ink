import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { Match, TeamIdentifier } from "./bracket";
import {
  eliminationBracket,
  fillParticipantsWithNullTillPowerOfTwo,
} from "./algorithms";

const AmountOfTeams = suite("Amount of teams");
const Byes = suite("Byes");
const Seeds = suite("Seeds");
const FillParticipantsWithNull = suite(
  "fillParticipantsWithNullTillPowerOfTwo()"
);

AmountOfTeams("Generates right amount of rounds (16 participants - SE)", () => {
  const bracket16 = eliminationBracket(16, "SE");
  assert.equal(removeMatchesWithByes(bracket16.winners).length, 15);
  assert.equal(removeMatchesWithByes(bracket16.losers).length, 0);
});

AmountOfTeams("Generates right amount of rounds (16 participants - DE)", () => {
  const bracket16 = eliminationBracket(16, "DE");
  assert.equal(removeMatchesWithByes(bracket16.winners).length, 16); // not incl reset
  assert.equal(removeMatchesWithByes(bracket16.losers).length, 14);
});

AmountOfTeams("Generates right amount of rounds (15 participants - DE)", () => {
  const bracket15 = eliminationBracket(15, "DE");
  assert.equal(removeMatchesWithByes(bracket15.winners).length, 15); // not incl reset
  assert.equal(removeMatchesWithByes(bracket15.losers).length, 14); // one bye
});

AmountOfTeams("Generates right amount of rounds (17 participants - DE)", () => {
  const bracket17 = eliminationBracket(17, "DE");
  assert.equal(removeMatchesWithByes(bracket17.winners).length, 17); // not incl reset
  assert.equal(removeMatchesWithByes(bracket17.losers).length, 30);

  assert.equal(removeMatchesWithByes(bracket17.winners).length, 17); // not incl reset
  assert.equal(removeMatchesWithByes(bracket17.losers).length, 30);
});

AmountOfTeams("Same amount of rounds as next power of two", () => {
  const bracket17 = eliminationBracket(17, "DE");
  const bracket32 = eliminationBracket(32, "DE");
  assert.equal(bracket17.winners.length, bracket32.winners.length); // not incl reset
  assert.equal(bracket17.losers.length, bracket32.losers.length);
});

Byes("Right amount of byes", () => {
  const bracket17 = eliminationBracket(17, "DE");
  assert.equal(countOpponentsWithByes(bracket17.winners), 15);
});

Byes("Correct team has bye", () => {
  const bracket15 = eliminationBracket(15, "DE");
  assert.equal(teamWithBye(bracket15.winners), 1);
});

Seeds("First and second seed are spread apart", () => {
  const bracket16 = eliminationBracket(16, "DE");
  assert.ok(
    [bracket16.winners[0].upperTeam, bracket16.winners[0].lowerTeam].includes(
      1
    ) ||
      [bracket16.winners[0].upperTeam, bracket16.winners[0].lowerTeam].includes(
        2
      )
  );
  let lastMatchWithATeam = bracket16.winners[0];
  for (const match of bracket16.winners) {
    if (!match.upperTeam) break;

    lastMatchWithATeam = match;
  }

  assert.ok(
    [lastMatchWithATeam.upperTeam, lastMatchWithATeam.lowerTeam].includes(1) ||
      [lastMatchWithATeam.upperTeam, lastMatchWithATeam.lowerTeam].includes(2)
  );
});

FillParticipantsWithNull("17", () => {
  const participants: TeamIdentifier[] = new Array(17)
    .fill(null)
    .map((_, i) => i + 1);
  assert.equal(participants.length, 17);
  fillParticipantsWithNullTillPowerOfTwo(participants);
  assert.equal(participants.length, 32);
  assert.equal(
    participants.reduce((acc: number, cur) => acc + (cur === "BYE" ? 1 : 0), 0),
    32 - 17
  );
});

function countOpponentsWithByes(matches: Match[]) {
  const byes = matches.filter(
    (match) => match.upperTeam === "BYE" || match.lowerTeam === "BYE"
  );

  return byes.length;
}

function removeMatchesWithByes(matches: Match[]) {
  return matches.filter(
    (match) => match.upperTeam !== "BYE" && match.lowerTeam !== "BYE"
  );
}

function teamWithBye(matches: Match[]) {
  for (const match of matches) {
    if (match.lowerTeam === "BYE") return match.upperTeam;
    if (match.upperTeam === "BYE") return match.lowerTeam;
  }

  throw new Error("No team with a BYE");
}

AmountOfTeams.run();
Byes.run();
Seeds.run();
FillParticipantsWithNull.run();
