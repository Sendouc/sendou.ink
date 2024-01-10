import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import invariant from "tiny-invariant";
import type { TournamentBracketsStyle } from "~/db/tables";
import { logger } from "~/utils/logger";
import { getTournamentManager } from "..";
import { findTeamsByTournamentId } from "~/features/tournament/queries/findTeamsByTournamentId.server";
import {
  TOURNAMENT,
  checkInHasStarted,
  teamHasCheckedIn,
} from "~/features/tournament";
import {
  fillWithNullTillPowerOfTwo,
  resolveTournamentStageSettings,
  resolveTournamentStageType,
} from "../tournament-bracket-utils";

/** Get bracket data either as it exists in DB or if in pre-started state then as preview */
export async function bracketData({
  bracketIdx = 0,
  tournamentId,
}: {
  bracketIdx?: number;
  tournamentId: number;
}): Promise<ValueToArray<DataTypes>> {
  const tournament =
    await TournamentRepository.findBracketProgressionByTournamentId(
      tournamentId,
    );

  const bracket = bracketByIndex({
    bracketsStyle: tournament.bracketsStyle,
    bracketIdx,
  });

  const bracketInDb = tournament.stages.find(
    (stage) => stage.name === bracket.name,
  );

  if (bracketInDb) {
    return getTournamentManager("SQL").get.stageData(bracketInDb.id);
  }

  const manager = getTournamentManager("IN_MEMORY");

  const { teams, enoughTeams } = teamsForBracket({
    tournamentId,
    bracket,
    checkInHasStarted: checkInHasStarted(tournament),
  });

  if (enoughTeams) {
    manager.create({
      tournamentId,
      name: bracket.name,
      type: resolveTournamentStageType(bracket.format),
      seeding: fillWithNullTillPowerOfTwo(teams.map((team) => team.name)),
      settings: resolveTournamentStageSettings(bracket.format),
    });
  }

  return manager.get.stageData(0);
}

function bracketByIndex({
  bracketsStyle,
  bracketIdx,
}: {
  bracketsStyle: TournamentBracketsStyle;
  bracketIdx: number;
}) {
  const bracket = bracketsStyle[bracketIdx];
  if (bracket) return bracket;

  const fallbackBracket = bracketsStyle[0];
  invariant(fallbackBracket, "No brackets found");

  logger.warn("Bracket not found, using fallback bracket");
  return fallbackBracket;
}

export async function teamsForBracketByBracketIdx({
  bracketIdx = 0,
  tournamentId,
}: {
  bracketIdx?: number;
  tournamentId: number;
}) {
  const tournament =
    await TournamentRepository.findBracketProgressionByTournamentId(
      tournamentId,
    );

  const bracket = bracketByIndex({
    bracketsStyle: tournament.bracketsStyle,
    bracketIdx,
  });

  return teamsForBracket({
    tournamentId,
    bracket,
    checkInHasStarted: checkInHasStarted(tournament),
  });
}

function teamsForBracket({
  tournamentId,
  bracket,
  checkInHasStarted,
}: {
  tournamentId: number;
  bracket: TournamentBracketsStyle[number];
  checkInHasStarted: boolean;
}) {
  return bracket.sources
    ? { teams: [], enoughTeams: false } // xxx: resolveTeamsFromSourceBrackets(...)
    : registeredTeamsReadyToPlay({ tournamentId, checkInHasStarted });
}

function registeredTeamsReadyToPlay({
  tournamentId,
  checkInHasStarted,
}: {
  tournamentId: number;
  checkInHasStarted: boolean;
}) {
  let teams = findTeamsByTournamentId(tournamentId);
  if (checkInHasStarted) {
    teams = teams.filter(teamHasCheckedIn);
  }

  return {
    teams,
    enoughTeams: teams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START,
  };
}
