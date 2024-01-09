import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import invariant from "tiny-invariant";
import type { TournamentBracketsStyle } from "~/db/tables";
import { logger } from "~/utils/logger";
import { getTournamentManager } from "..";
import { findTeamsByTournamentId } from "~/features/tournament/queries/findTeamsByTournamentId.server";
import { TOURNAMENT } from "~/features/tournament";
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
  const { bracketsStyle, stages } =
    await TournamentRepository.findBracketProgressionByTournamentId(
      tournamentId,
    );

  const bracket = bracketByIndex({ bracketsStyle, bracketIdx });

  const bracketInDb = stages.find((stage) => stage.name === bracket.name);

  if (bracketInDb) {
    return getTournamentManager("SQL").get.stageData(bracketInDb.id);
  }

  const manager = getTournamentManager("IN_MEMORY");

  const { teams, enoughTeams } = bracket.sources
    ? { teams: [], enoughTeams: false } // xxx: resolveTeamsFromSourceBrackets(...)
    : registeredTeamsReadyToPlay({ tournamentId });

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

export function registeredTeamsReadyToPlay({
  tournamentId,
}: {
  tournamentId: number;
}) {
  const teams = findTeamsByTournamentId(tournamentId);
  // xxx: checkInHasStarted
  // if (checkInHasStarted(tournament)) {
  //   teams = teams.filter(teamHasCheckedIn);
  // }

  return {
    teams,
    enoughTeams: teams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START,
  };
}
