import type {
  MapResult,
  PlayerResult,
  Skill,
  TournamentResult,
} from "~/db/types";
import type { AllMatchResult } from "../queries/allMatchResultsByTournamentId.server";
import type { FindTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import invariant from "tiny-invariant";
import { removeDuplicates } from "~/utils/arrays";
import { type FinalStanding } from "~/features/tournament-bracket/core/finalStandings.server";

interface TournamentSummary {
  skills: Skill[];
  mapResultDeltas: MapResult[];
  playerResultDeltas: PlayerResult[];
  tournamentResults: Omit<TournamentResult, "tournamentId">[];
}

type UserIdToTeamId = Record<number, number>;

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
    skills: skills(),
    mapResultDeltas: mapResultDeltas({ results, userIdsToTeamId }),
    playerResultDeltas: playerResultDeltas({ results, userIdsToTeamId }),
    tournamentResults: tournamentResults({
      participantsCount: teams.length,
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

function skills(): Skill[] {
  return [];
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
  participantsCount,
  finalStandings,
}: {
  participantsCount: number;
  finalStandings: FinalStanding[];
}) {
  const result: TournamentSummary["tournamentResults"] = [];

  for (const standing of finalStandings) {
    for (const player of standing.players) {
      result.push({
        participantsCount,
        placement: standing.placement,
        tournamentTeamId: standing.tournamentTeam.id,
        userId: player.id,
      });
    }
  }

  return result;
}
