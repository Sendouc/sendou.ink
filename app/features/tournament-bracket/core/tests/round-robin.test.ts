import { suite } from "uvu";
import { FIVE_TEAMS_RR, FOUR_TEAMS_RR } from "./mocks";
import { adjustResults, testTournament } from "./test-utils";
import * as assert from "uvu/assert";

const RoundRobinStandings = suite("Round Robin Standings");

RoundRobinStandings.skip("resolves standings from points", () => {
  const tournament = testTournament(
    adjustResults(FOUR_TEAMS_RR(), [
      { ids: [0, 3], score: [2, 0] },
      { ids: [2, 1], score: [0, 2] },
      { ids: [1, 3], score: [2, 0] },
      { ids: [0, 2], score: [2, 0] },
      { ids: [2, 3], score: [2, 0] },
      { ids: [1, 0], score: [0, 2] },
    ]),
  );

  const standings = tournament.standings;

  assert.equal(standings.length, 4);
  assert.equal(standings[0].team.id, 0);
  assert.equal(standings[0].placement, 1);
  assert.equal(standings[1].team.id, 1);
  assert.equal(standings[2].team.id, 2);
  assert.equal(standings[3].team.id, 3);
});

RoundRobinStandings.skip("tiebreaker via head-to-head", () => {
  // id 0 = WWWW
  // id 1 = WWWL
  // id 2 = WWLL
  // id 3 = WWLL but won against 2
  // id 4 = LLLL
  const tournament = testTournament(
    adjustResults(FIVE_TEAMS_RR(), [
      {
        ids: [4, 1],
        score: [0, 2],
      },
      {
        ids: [3, 2],
        score: [2, 0],
      },
      {
        ids: [0, 2],
        score: [2, 0],
      },
      {
        ids: [4, 3],
        score: [0, 2],
      },
      {
        ids: [1, 3],
        score: [2, 0],
      },
      {
        ids: [0, 4],
        score: [2, 0],
      },
      {
        ids: [2, 4],
        score: [2, 0],
      },
      {
        ids: [1, 0],
        score: [0, 2],
      },
      {
        ids: [3, 0],
        score: [0, 2],
      },
      {
        ids: [2, 1],
        score: [2, 0],
      },
    ]),
  );

  const standings = tournament.standings;

  assert.equal(standings.length, 5);
  assert.equal(standings[2].team.id, 3);
  assert.equal(standings[2].placement, 3);
  assert.equal(standings[3].team.id, 2);
  assert.equal(standings[3].placement, 4);
});

RoundRobinStandings.skip("tiebreaker via maps won", () => {
  // id 0 = WWWW
  // id 1 = WWLL
  // id 2 = WWLL
  // id 3 = WWLL
  const tournament = testTournament(
    adjustResults(FOUR_TEAMS_RR(), [
      { ids: [0, 3], score: [2, 0] },
      { ids: [2, 1], score: [0, 2] },
      { ids: [1, 3], score: [0, 2] },
      { ids: [0, 2], score: [2, 0] },
      { ids: [2, 3], score: [2, 1] },
      { ids: [1, 0], score: [0, 2] },
    ]),
  );

  const standings = tournament.standings;

  // they won the most maps out of the 3 tied teams
  assert.equal(standings[1].team.id, 3);
});

RoundRobinStandings.skip("three way tiebreaker via points scored", () => {});

RoundRobinStandings.skip(
  "if two groups finished, standings for both groups",
  () => {},
);

RoundRobinStandings.skip(
  "if one group finished and other ongoing, standings for just one group",
  () => {},
);

RoundRobinStandings.run();
