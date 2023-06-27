import type {
  MapResult,
  PlayerResult,
  Skill,
  TournamentResult,
} from "~/db/types";
import type { AllMatchResult } from "../queries/allMatchResultsByTournamentId.server";
import type { FindTeamsByTournamentId } from "../../tournament/queries/findTeamsByTournamentId.server";
import invariant from "tiny-invariant";
import { removeDuplicates } from "~/utils/arrays";
import { type FinalStanding } from "./finalStandings.server";
import type { Rating } from "openskill/dist/types";
import {
  queryCurrentTeamRating,
  queryCurrentUserRating,
  rate,
  userIdsToIdentifier,
} from "~/features/mmr";
import shuffle from "just-shuffle";

export interface TournamentSummary {
  skills: Omit<Skill, "tournamentId" | "id" | "ordinal">[];
  mapResultDeltas: MapResult[];
  playerResultDeltas: PlayerResult[];
  tournamentResults: Omit<TournamentResult, "tournamentId" | "isHighlight">[];
}

type UserIdToTeamId = Record<number, number>;

// xxx: tests
export function tournamentSummary({
  results,
  teams,
  finalStandings,
}: {
  results: AllMatchResult[];
  teams: FindTeamsByTournamentId;
  finalStandings: FinalStanding[];
}): TournamentSummary {
  const userIdsToTeamId = userIdsToTeamIdRecord(teams);

  return {
    skills: skills({ results, userIdsToTeamId }),
    mapResultDeltas: mapResultDeltas({ results, userIdsToTeamId }),
    playerResultDeltas: playerResultDeltas({ results, userIdsToTeamId }),
    tournamentResults: tournamentResults({
      participantCount: teams.length,
      finalStandings,
    }),
  };
}

function userIdsToTeamIdRecord(teams: FindTeamsByTournamentId) {
  const result: UserIdToTeamId = {};

  for (const team of teams) {
    for (const member of team.members) {
      result[member.userId] = team.id;
    }
  }

  return result;
}

function skills({
  results,
  userIdsToTeamId,
}: {
  results: AllMatchResult[];
  userIdsToTeamId: UserIdToTeamId;
}) {
  const result: TournamentSummary["skills"] = [];

  result.push(...calculateIndividualPlayerSkills({ results, userIdsToTeamId }));
  result.push(...calculateTeamSkills({ results, userIdsToTeamId }));

  return result;
}

function calculateIndividualPlayerSkills({
  results,
  userIdsToTeamId,
}: {
  results: AllMatchResult[];
  userIdsToTeamId: UserIdToTeamId;
}) {
  const userRatings = new Map<number, Rating>();
  const userMatchesCount = new Map<number, number>();
  const getUserRating = (userId: number) => {
    const existingRating = userRatings.get(userId);
    if (existingRating) return existingRating;

    return queryCurrentUserRating(userId);
  };

  for (const match of results) {
    const winnerTeamId =
      match.opponentOne.result === "win"
        ? match.opponentOne.id
        : match.opponentTwo.id;

    const allUserIds = removeDuplicates(match.maps.flatMap((m) => m.userIds));
    const loserUserIds = allUserIds.filter(
      (userId) => userIdsToTeamId[userId] !== winnerTeamId
    );
    const winnerUserIds = allUserIds.filter(
      (userId) => userIdsToTeamId[userId] === winnerTeamId
    );

    const [ratedWinners, ratedLosers] = rate([
      winnerUserIds.map(getUserRating),
      loserUserIds.map(getUserRating),
    ]);

    for (const [i, rating] of ratedWinners.entries()) {
      const userId = winnerUserIds[i];
      invariant(userId, "userId should exist");

      userRatings.set(userId, rating);
      userMatchesCount.set(userId, (userMatchesCount.get(userId) ?? 0) + 1);
    }

    for (const [i, rating] of ratedLosers.entries()) {
      const userId = loserUserIds[i];
      invariant(userId, "userId should exist");

      userRatings.set(userId, rating);
      userMatchesCount.set(userId, (userMatchesCount.get(userId) ?? 0) + 1);
    }
  }

  return Array.from(userRatings.entries()).map(([userId, rating]) => {
    const matchesCount = userMatchesCount.get(userId);
    invariant(matchesCount, "matchesCount should exist");

    return {
      mu: rating.mu,
      sigma: rating.sigma,
      userId,
      identifier: null,
      matchesCount,
    };
  });
}

function calculateTeamSkills({
  results,
  userIdsToTeamId,
}: {
  results: AllMatchResult[];
  userIdsToTeamId: UserIdToTeamId;
}) {
  const teamRatings = new Map<string, Rating>();
  const teamMatchesCount = new Map<string, number>();
  const getTeamRating = (identifier: string) => {
    const existingRating = teamRatings.get(identifier);
    if (existingRating) return existingRating;

    return queryCurrentTeamRating(identifier);
  };

  for (const match of results) {
    const winnerTeamId =
      match.opponentOne.result === "win"
        ? match.opponentOne.id
        : match.opponentTwo.id;

    const winnerTeamIdentifiers = match.maps.flatMap((m) => {
      const winnerUserIds = m.userIds.filter(
        (userId) => userIdsToTeamId[userId] === winnerTeamId
      );

      return userIdsToIdentifier(winnerUserIds);
    });
    const winnerTeamIdentifier = selectMostPopular(winnerTeamIdentifiers);

    const loserTeamIdentifiers = match.maps.flatMap((m) => {
      const loserUserIds = m.userIds.filter(
        (userId) => userIdsToTeamId[userId] !== winnerTeamId
      );

      return userIdsToIdentifier(loserUserIds);
    });
    const loserTeamIdentifier = selectMostPopular(loserTeamIdentifiers);

    const [[ratedWinner], [ratedLoser]] = rate([
      [getTeamRating(winnerTeamIdentifier)],
      [getTeamRating(loserTeamIdentifier)],
    ]);

    teamRatings.set(winnerTeamIdentifier, ratedWinner);
    teamRatings.set(loserTeamIdentifier, ratedLoser);

    teamMatchesCount.set(
      winnerTeamIdentifier,
      (teamMatchesCount.get(winnerTeamIdentifier) ?? 0) + 1
    );
    teamMatchesCount.set(
      loserTeamIdentifier,
      (teamMatchesCount.get(loserTeamIdentifier) ?? 0) + 1
    );
  }

  return Array.from(teamRatings.entries()).map(([identifier, rating]) => {
    const matchesCount = teamMatchesCount.get(identifier);
    invariant(matchesCount, "matchesCount should exist");

    return {
      mu: rating.mu,
      sigma: rating.sigma,
      userId: null,
      identifier,
      matchesCount,
    };
  });
}

function selectMostPopular<T>(items: T[]): T {
  const counts = new Map<T, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries()).sort(
    ([, countA], [, countB]) => countB - countA
  );

  const mostPopularCount = sorted[0][1];

  const mostPopularItems = sorted.filter(
    ([, count]) => count === mostPopularCount
  );

  if (mostPopularItems.length === 1) {
    return mostPopularItems[0][0];
  }

  return shuffle(mostPopularItems)[0][0];
}

function mapResultDeltas({
  results,
  userIdsToTeamId,
}: {
  results: AllMatchResult[];
  userIdsToTeamId: UserIdToTeamId;
}): MapResult[] {
  const result: MapResult[] = [];

  const addMapResult = (
    mapResult: Pick<MapResult, "stageId" | "mode" | "userId"> & {
      type: "win" | "loss";
    }
  ) => {
    const existingResult = result.find(
      (r) =>
        r.userId === mapResult.userId &&
        r.stageId == mapResult.stageId &&
        r.mode === mapResult.mode
    );

    if (existingResult) {
      existingResult[mapResult.type === "win" ? "wins" : "losses"] += 1;
    } else {
      result.push({
        userId: mapResult.userId,
        stageId: mapResult.stageId,
        mode: mapResult.mode,
        wins: mapResult.type === "win" ? 1 : 0,
        losses: mapResult.type === "loss" ? 1 : 0,
      });
    }
  };

  for (const match of results) {
    for (const map of match.maps) {
      for (const userId of map.userIds) {
        const tournamentTeamId = userIdsToTeamId[userId];
        invariant(
          tournamentTeamId,
          `Couldn't resolve tournament team id for user id ${userId}`
        );

        addMapResult({
          mode: map.mode,
          stageId: map.stageId,
          type: tournamentTeamId === map.winnerTeamId ? "win" : "loss",
          userId,
        });
      }
    }
  }

  return result;
}

function playerResultDeltas({
  results,
  userIdsToTeamId,
}: {
  results: AllMatchResult[];
  userIdsToTeamId: UserIdToTeamId;
}): PlayerResult[] {
  const result: PlayerResult[] = [];

  const addPlayerResult = (playerResult: PlayerResult) => {
    const existingResult = result.find(
      (r) =>
        r.type === playerResult.type &&
        r.otherUserId === playerResult.otherUserId &&
        r.ownerUserId === playerResult.ownerUserId
    );

    if (existingResult) {
      existingResult.mapLosses += playerResult.mapLosses;
      existingResult.mapWins += playerResult.mapWins;
      existingResult.setLosses += playerResult.setLosses;
      existingResult.setWins += playerResult.setWins;
    } else {
      result.push(playerResult);
    }
  };

  for (const match of results) {
    for (const map of match.maps) {
      for (const ownerUserId of map.userIds) {
        for (const otherUserId of map.userIds) {
          if (ownerUserId === otherUserId) continue;

          const ownTournamentTeamId = userIdsToTeamId[ownerUserId];
          invariant(
            ownTournamentTeamId,
            `Couldn't resolve tournament team id for user id ${ownerUserId}`
          );
          const otherTournamentTeamId = userIdsToTeamId[otherUserId];
          invariant(
            otherTournamentTeamId,
            `Couldn't resolve tournament team id for user id ${otherUserId}`
          );

          const won = ownTournamentTeamId === map.winnerTeamId;

          addPlayerResult({
            ownerUserId,
            otherUserId,
            mapLosses: won ? 0 : 1,
            mapWins: won ? 1 : 0,
            setLosses: 0,
            setWins: 0,
            type:
              ownTournamentTeamId === otherTournamentTeamId ? "MATE" : "ENEMY",
          });
        }
      }
    }

    const allUserIds = removeDuplicates(match.maps.flatMap((m) => m.userIds));

    for (const ownerUserId of allUserIds) {
      for (const otherUserId of allUserIds) {
        if (ownerUserId === otherUserId) continue;

        const ownTournamentTeamId = userIdsToTeamId[ownerUserId];
        invariant(
          ownTournamentTeamId,
          `Couldn't resolve tournament team id for user id ${ownerUserId}`
        );
        const otherTournamentTeamId = userIdsToTeamId[otherUserId];
        invariant(
          otherTournamentTeamId,
          `Couldn't resolve tournament team id for user id ${otherUserId}`
        );

        const result =
          match.opponentOne.id === ownTournamentTeamId
            ? match.opponentOne.result
            : match.opponentTwo.result;
        const won = result === "win";

        addPlayerResult({
          ownerUserId,
          otherUserId,
          mapLosses: 0,
          mapWins: 0,
          setLosses: won ? 0 : 1,
          setWins: won ? 1 : 0,
          type:
            ownTournamentTeamId === otherTournamentTeamId ? "MATE" : "ENEMY",
        });
      }
    }
  }

  return result;
}

function tournamentResults({
  participantCount,
  finalStandings,
}: {
  participantCount: number;
  finalStandings: FinalStanding[];
}) {
  const result: TournamentSummary["tournamentResults"] = [];

  for (const standing of finalStandings) {
    for (const player of standing.players) {
      result.push({
        participantCount,
        placement: standing.placement,
        tournamentTeamId: standing.tournamentTeam.id,
        userId: player.id,
      });
    }
  }

  return result;
}
