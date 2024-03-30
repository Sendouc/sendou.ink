import { suite } from "uvu";
import * as assert from "uvu/assert";
import { tournamentSummary } from "./summarizer.server";
import { ordinal, rating } from "openskill";
import type { AllMatchResult } from "../queries/allMatchResultsByTournamentId.server";
import type { TournamentDataTeam } from "./Tournament.server";

const TournamentSummary = suite("tournamentSummary()");

const createTeam = (teamId: number, userIds: number[]): TournamentDataTeam => ({
  checkIns: [],
  createdAt: 0,
  id: teamId,
  inviteCode: null,
  mapPool: [],
  members: userIds.map((userId) => ({
    country: null,
    customUrl: null,
    discordAvatar: null,
    discordId: "123",
    discordName: "test",
    inGameName: "test",
    isOwner: 0,
    plusTier: null,
    createdAt: 0,
    userId,
  })),
  name: "Team " + teamId,
  prefersNotToHost: 0,
  noScreen: 0,
  team: null,
  seed: 1,
});

function summarize({ results }: { results?: AllMatchResult[] } = {}) {
  return tournamentSummary({
    finalStandings: [
      {
        placement: 1,
        team: createTeam(1, [1, 2, 3, 4]),
      },
      {
        placement: 2,
        team: createTeam(2, [5, 6, 7, 8]),
      },
      {
        placement: 3,
        team: createTeam(3, [9, 10, 11, 12]),
      },
      {
        placement: 4,
        team: createTeam(4, [13, 14, 15, 16]),
      },
    ],
    results: results ?? [
      {
        maps: [
          {
            mode: "SZ",
            stageId: 1,
            userIds: [1, 2, 3, 4, 5, 6, 7, 8],
            winnerTeamId: 1,
          },
          {
            mode: "TC",
            stageId: 2,
            userIds: [1, 2, 3, 4, 5, 6, 7, 8],
            winnerTeamId: 1,
          },
        ],
        opponentOne: {
          id: 1,
          result: "win",
          score: 2,
        },
        opponentTwo: {
          id: 2,
          result: "loss",
          score: 0,
        },
      },
    ],
    teams: [
      {
        id: 1,
        members: [
          { userId: 1 },
          { userId: 2 },
          { userId: 3 },
          { userId: 4 },
          { userId: 20 },
        ],
      },
      {
        id: 2,
        members: [{ userId: 5 }, { userId: 6 }, { userId: 7 }, { userId: 8 }],
      },
      {
        id: 3,
        members: [
          { userId: 9 },
          { userId: 10 },
          { userId: 11 },
          { userId: 12 },
        ],
      },
      {
        id: 4,
        members: [
          { userId: 13 },
          { userId: 14 },
          { userId: 15 },
          { userId: 16 },
        ],
      },
    ],
    queryCurrentTeamRating: () => rating(),
    queryCurrentUserRating: () => rating(),
    queryTeamPlayerRatingAverage: () => rating(),
  });
}

TournamentSummary("calculates final standings", () => {
  const summary = summarize();

  // each player of each team should have one result
  assert.equal(summary.tournamentResults.length, 4 * 4);
});

TournamentSummary(
  "winners skill should go up, losers skill should go down",
  () => {
    const summary = summarize();

    const winnerSkill = summary.skills.find((s) => s.userId === 1);
    const loserSkill = summary.skills.find((s) => s.userId === 5);

    assert.ok(winnerSkill);
    assert.ok(loserSkill);

    assert.ok(ordinal(winnerSkill) > ordinal(loserSkill));
  },
);

const resultsWith20: AllMatchResult[] = [
  {
    maps: [
      {
        mode: "SZ",
        stageId: 1,
        userIds: [1, 2, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 1,
      },
      {
        mode: "TC",
        stageId: 2,
        userIds: [1, 2, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 1,
      },
    ],
    opponentOne: {
      id: 1,
      result: "win",
      score: 2,
    },
    opponentTwo: {
      id: 2,
      result: "loss",
      score: 0,
    },
  },
  {
    maps: [
      {
        mode: "SZ",
        stageId: 1,
        userIds: [1, 20, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 1,
      },
      {
        mode: "TC",
        stageId: 2,
        userIds: [1, 20, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 1,
      },
    ],
    opponentOne: {
      id: 1,
      result: "win",
      score: 2,
    },
    opponentTwo: {
      id: 2,
      result: "loss",
      score: 0,
    },
  },
];

TournamentSummary("winning more than once makes the skill go up more", () => {
  const summary = summarize({
    results: resultsWith20,
  });

  const twoTimeWinnerSkill = summary.skills.find((s) => s.userId === 1);
  const oneTimeWinnerSkill = summary.skills.find((s) => s.userId === 2);

  assert.ok(twoTimeWinnerSkill);
  assert.ok(oneTimeWinnerSkill);

  assert.ok(ordinal(twoTimeWinnerSkill) > ordinal(oneTimeWinnerSkill));
});

TournamentSummary("calculates team skills (many rosters for same team)", () => {
  const summary = summarize({
    results: resultsWith20,
  });

  const teamOneRosterOne = summary.skills.find(
    (s) => s.identifier === "1-2-3-4",
  );
  const teamOneRosterTwo = summary.skills.find(
    (s) => s.identifier === "1-3-4-20",
  );

  assert.ok(teamOneRosterOne);
  assert.ok(teamOneRosterTwo);
});

const resultsWithSubbedRoster: AllMatchResult[] = [
  {
    maps: [
      {
        mode: "SZ",
        stageId: 1,
        userIds: [1, 2, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 1,
      },
      {
        mode: "TC",
        stageId: 2,
        userIds: [1, 2, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 2,
      },
      {
        mode: "TC",
        stageId: 2,
        userIds: [1, 20, 3, 4, 5, 6, 7, 8],
        winnerTeamId: 1,
      },
    ],
    opponentOne: {
      id: 1,
      result: "win",
      score: 2,
    },
    opponentTwo: {
      id: 2,
      result: "loss",
      score: 1,
    },
  },
];

TournamentSummary(
  "In the case of sub calculates skill based on the most common roster",
  () => {
    const summary = summarize({
      results: resultsWithSubbedRoster,
    });

    const teamOneRosterOne = summary.skills.find(
      (s) => s.identifier === "1-2-3-4",
    );
    const teamOneRosterTwo = summary.skills.find(
      (s) => s.identifier === "1-3-4-20",
    );

    assert.ok(teamOneRosterOne);
    assert.not.ok(teamOneRosterTwo);
  },
);

TournamentSummary(
  "In the case of sub calculates player results based on the most common roster",
  () => {
    const summary = summarize({
      results: resultsWithSubbedRoster,
    });

    assert.not.ok(
      summary.playerResultDeltas.find(
        (p) =>
          p.ownerUserId === 5 &&
          p.otherUserId === 20 &&
          (p.setWins > 0 || p.setLosses > 0),
      ),
      "player 5 should not have a result against player 20 (sub for only one game)",
    );
  },
);

TournamentSummary("calculates results of mates", () => {
  const summary = summarize();

  const result = summary.playerResultDeltas.find(
    (r) => r.ownerUserId === 1 && r.otherUserId === 2,
  );

  assert.ok(result);

  assert.equal(result.setWins, 1);
  assert.equal(result.setLosses, 0);
  assert.equal(result.mapWins, 2);
  assert.equal(result.mapLosses, 0);
  assert.equal(result.type, "MATE");
});

TournamentSummary("calculates results of opponents", () => {
  const summary = summarize();

  const result = summary.playerResultDeltas.find(
    (r) => r.ownerUserId === 1 && r.otherUserId === 5,
  );

  assert.ok(result);

  assert.equal(result.setWins, 1);
  assert.equal(result.setLosses, 0);
  assert.equal(result.mapWins, 2);
  assert.equal(result.mapLosses, 0);
  assert.equal(result.type, "ENEMY");
});

TournamentSummary("calculates results of opponents (losing side)", () => {
  const summary = summarize();

  const result = summary.playerResultDeltas.find(
    (r) => r.ownerUserId === 5 && r.otherUserId === 1,
  );

  assert.ok(result);

  assert.equal(result.setWins, 0);
  assert.equal(result.setLosses, 1);
  assert.equal(result.mapWins, 0);
  assert.equal(result.mapLosses, 2);
  assert.equal(result.type, "ENEMY");
});

TournamentSummary("calculates map results", () => {
  const summary = summarize();

  const result = summary.mapResultDeltas.filter((r) => r.userId === 1);

  assert.equal(result.length, 2);
  assert.ok(result.every((r) => r.wins === 1 && r.losses === 0));
});

TournamentSummary.run();
