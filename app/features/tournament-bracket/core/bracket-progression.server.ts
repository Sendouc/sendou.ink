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
import { assertUnreachable } from "~/utils/types";

type BracketProgressionTeam = { id: number; name: string };

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
    tournament,
    bracket,
  });

  // no stages but return what we can
  if (!enoughTeams) return manager.get.tournamentData(tournamentId);

  manager.create({
    tournamentId,
    name: bracket.name,
    type: resolveTournamentStageType(bracket.format),
    seeding: fillWithNullTillPowerOfTwo(teams.map((team) => team.name)),
    settings: resolveTournamentStageSettings(bracket.format),
  });

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
    tournament,
    bracket,
  });
}

function teamsForBracket({
  bracket,
  tournament,
}: {
  bracket: TournamentBracketsStyle[number];
  tournament: TournamentRepository.FindBracketProgressionByTournamentIdItem;
}) {
  return bracket.sources
    ? teamsFromAnotherBracketsReadyToPlay({ bracket, tournament })
    : registeredTeamsReadyToPlay({
        tournamentId: tournament.id,
        checkInHasStarted: checkInHasStarted(tournament),
      });
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

// xxx: checked-in
function teamsFromAnotherBracketsReadyToPlay({
  bracket,
  tournament,
}: {
  bracket: TournamentBracketsStyle[number];
  tournament: TournamentRepository.FindBracketProgressionByTournamentIdItem;
}) {
  const sources = bracket.sources;
  invariant(sources, "Bracket sources not found");

  const teams: BracketProgressionTeam[] = [];

  for (const { bracketIdx, placements } of sources) {
    const sourceBracket = bracketByIndex({
      bracketsStyle: tournament.bracketsStyle,
      bracketIdx,
    });

    switch (sourceBracket.format) {
      case "SE": {
        throw new Error("Not implemented");
      }
      case "DE": {
        teams.push(
          ...teamsFromDoubleElim({ placements, tournament, sourceBracket }),
        );
        break;
      }
      case "RR": {
        throw new Error("Not implemented");
      }
      default: {
        assertUnreachable(sourceBracket.format);
      }
    }
  }

  return { teams, enoughTeams: true };
}

function teamsFromDoubleElim({
  placements,
  tournament,
  sourceBracket,
}: {
  placements: number[];
  tournament: TournamentRepository.FindBracketProgressionByTournamentIdItem;
  sourceBracket: TournamentBracketsStyle[number];
}): BracketProgressionTeam[] {
  const bracketInDb = tournament.stages.find(
    (stage) => stage.name === sourceBracket.name,
  );

  // stage has not started yet
  if (!bracketInDb) return [];

  const data = getTournamentManager("SQL").get.stageData(bracketInDb.id);
  console.log(data);

  // xxx: todo
  return [];
}
