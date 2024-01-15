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

// xxx: no check-in if bracket is not a underground etc. bracket
/** Get bracket data either as it exists in DB or if in pre-started state then as preview */
export async function bracketData({
  bracketIdx,
  tournamentId,
}: {
  bracketIdx: number;
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

  const bracketInDb = tournament.stages.find(
    (stage) => stage.name === bracket.name,
  );

  if (bracketInDb) {
    return getTournamentManager("SQL").get.stageData(bracketInDb.id);
  }

  const manager = getTournamentManager("IN_MEMORY");

  const { teams, enoughTeams } = await teamsForBracket({
    bracketIdx,
    tournament,
  });

  // no stages but return what we can
  if (!enoughTeams) {
    return manager.get.tournamentData(tournamentId);
  }

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

export async function teamsForBracket({
  bracketIdx,
  tournament,
  allTeams,
}: {
  bracketIdx: number;
  tournament: TournamentRepository.FindBracketProgressionByTournamentIdItem;
  allTeams?: boolean;
}) {
  const bracket = bracketByIndex({
    bracketsStyle: tournament.bracketsStyle,
    bracketIdx,
  });

  return bracket.sources
    ? await teamsFromAnotherBracketsReadyToPlay({
        bracket,
        tournament,
        bracketIdx,
        allTeams,
      })
    : registeredTeamsReadyToPlay({
        tournamentId: tournament.id,
        checkInHasStarted: checkInHasStarted(tournament),
        allTeams,
      });
}

function registeredTeamsReadyToPlay({
  tournamentId,
  checkInHasStarted,
  allTeams,
}: {
  tournamentId: number;
  checkInHasStarted: boolean;
  allTeams?: boolean;
}) {
  const teams = findTeamsByTournamentId(tournamentId);
  const checkedInTeams =
    checkInHasStarted && !allTeams ? teams.filter(teamHasCheckedIn) : teams;

  return {
    teams: checkedInTeams,
    enoughTeams: checkedInTeams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START,
  };
}

async function teamsFromAnotherBracketsReadyToPlay({
  bracket,
  tournament,
  bracketIdx,
  allTeams,
}: {
  bracket: TournamentBracketsStyle[number];
  tournament: TournamentRepository.FindBracketProgressionByTournamentIdItem;
  bracketIdx: number;
  allTeams?: boolean;
}) {
  const sources = bracket.sources;
  invariant(sources, "Bracket sources not found");

  const teams: BracketProgressionTeam[] = [];

  let bracketReadyToStart = true;
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
        const { teams: teamsFromBracket, relevantMatchesFinished } =
          teamsFromDoubleElim({
            placements,
            tournament,
            sourceBracket,
          });
        teams.push(...teamsFromBracket);

        if (!relevantMatchesFinished) {
          bracketReadyToStart = false;
        }
        break;
      }
      // xxx: implement
      case "RR": {
        throw new Error("Not implemented");
      }
      default: {
        assertUnreachable(sourceBracket.format);
      }
    }
  }

  const checkedInTeams = await (async () => {
    if (!bracketReadyToStart || allTeams) return teams;

    const checkedInTeams =
      await TournamentRepository.checkedInTournamentTeamsByBracket({
        bracketIdx,
        tournamentId: tournament.id,
      });

    return teams.filter((team) =>
      checkedInTeams.some(
        (checkedInTeam) => checkedInTeam.tournamentTeamId === team.id,
      ),
    );
  })();

  return {
    teams: checkedInTeams,
    enoughTeams: checkedInTeams.length >= TOURNAMENT.ENOUGH_TEAMS_TO_START,
  };
}

const teamsWithNames = ({
  teams,
  bracketData,
}: {
  teams: { id: number }[];
  bracketData: ValueToArray<DataTypes>;
}) => {
  return teams.map((team) => {
    const name = bracketData.participant.find(
      (participant) => participant.id === team.id,
    )?.name;
    invariant(name, `Team name not found for id: ${team.id}`);

    return {
      id: team.id,
      name,
    };
  });
};

function teamsFromDoubleElim({
  placements,
  tournament,
  sourceBracket,
}: {
  placements: number[];
  tournament: TournamentRepository.FindBracketProgressionByTournamentIdItem;
  sourceBracket: TournamentBracketsStyle[number];
}) {
  const resolveLosersGroupId = (data: ValueToArray<DataTypes>) => {
    const minGroupId = Math.min(...data.round.map((round) => round.group_id));

    return minGroupId + 1;
  };
  const placementsToRoundsIds = (
    data: ValueToArray<DataTypes>,
    groupId: number,
  ) => {
    const losersRounds = data.round.filter(
      (round) => round.group_id === groupId,
    );
    const orderedRoundsIds = losersRounds
      .map((round) => round.id)
      .sort((a, b) => a - b);
    const amountOfRounds = Math.abs(Math.min(...placements));
    return orderedRoundsIds.slice(0, amountOfRounds);
  };

  invariant(
    placements.every((placement) => placement < 0),
    "Positive placements in DE not implemented",
  );

  const bracketInDb = tournament.stages.find(
    (stage) => stage.name === sourceBracket.name,
  );

  // stage has not started yet
  if (!bracketInDb) return { teams: [], relevantMatchesFinished: false };

  const data = getTournamentManager("SQL").get.stageData(bracketInDb.id);

  const losersGroupId = resolveLosersGroupId(data);
  const sourceRoundsIds = placementsToRoundsIds(data, losersGroupId).sort(
    // teams who made it further in the bracket get higher seed
    (a, b) => b - a,
  );

  const teams: { id: number }[] = [];
  let relevantMatchesFinished = true;
  for (const roundId of sourceRoundsIds) {
    const roundsMatches = data.match.filter(
      (match) => match.round_id === roundId,
    );

    for (const match of roundsMatches) {
      if (
        match.opponent1?.result !== "win" &&
        match.opponent2?.result !== "win"
      ) {
        relevantMatchesFinished = false;
        continue;
      }

      const loser =
        match.opponent1?.result === "win" ? match.opponent2 : match.opponent1;
      invariant(loser?.id, "Loser id not found");

      teams.push({ id: loser.id });
    }
  }

  return {
    relevantMatchesFinished,
    teams: teamsWithNames({ teams, bracketData: data }),
  };
}
