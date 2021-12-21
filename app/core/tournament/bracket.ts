import type { BracketType, Stage, TeamOrder } from ".prisma/client";
import invariant from "tiny-invariant";
import { generateMapListForRounds } from "./mapList";
import { Bracket, eliminationBracket } from "./algorithms";
import type { UseTournamentRoundsState } from "../../hooks/useTournamentRounds/types";
import { FindTournamentByNameForUrlI } from "../../services/tournament";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "../../constants";

export function participantCountToRoundsInfo({
  bracket,
  mapPool,
}: {
  bracket: Bracket;
  mapPool: Stage[];
}): EliminationBracket<
  {
    name: string;
    bestOf: BestOf;
    mapList: Stage[];
  }[]
> {
  const roundNames = getRoundNames(bracket);
  const roundsDefaultBestOf = getRoundsDefaultBestOf(bracket);
  const mapList = generateMapListForRounds({
    mapPool,
    rounds: roundsDefaultBestOf,
  });

  // TODO: invariants

  return {
    winners: roundNames.winners.map((roundName, i) => {
      const bestOf = roundsDefaultBestOf.winners[i];
      const maps = mapList.winners[i];
      invariant(bestOf, "bestOf undefined in winners");
      invariant(maps, "maps undefined in winners");
      return {
        name: roundName,
        bestOf,
        mapList: maps,
      };
    }),
    losers: roundNames.losers.map((roundName, i) => {
      const bestOf = roundsDefaultBestOf.losers[i];
      const maps = mapList.losers[i];
      invariant(bestOf, "bestOf undefined in losers");
      invariant(maps, "bestOf undefined in losers");
      return {
        name: roundName,
        bestOf,
        mapList: maps,
      };
    }),
  };
}

const WINNERS_DEFAULT = 5;
const WINNERS_FIRST_TWO_DEFAULT = 3;
const GRAND_FINALS_DEFAULT = 7;
const GRAND_FINALS_RESET_DEFAULT = 7;
const LOSERS_DEFAULT = 3;
const LOSERS_FINALS_DEFAULT = 5;

export type BestOf = 3 | 5 | 7 | 9;

export function getRoundsDefaultBestOf(
  bracket: Bracket
): EliminationBracket<BestOf[]> {
  const { winners: winnersRoundCount, losers: losersRoundCount } =
    countRounds(bracket);

  return {
    winners: new Array(winnersRoundCount).fill(null).map((_, i) => {
      const isSE = losersRoundCount === 0;
      if (i === 0) return WINNERS_FIRST_TWO_DEFAULT;
      if (i === 1) return WINNERS_FIRST_TWO_DEFAULT;
      if (i === winnersRoundCount - 2 + Number(isSE)) {
        return GRAND_FINALS_DEFAULT;
      }
      if (i === winnersRoundCount - 1) return GRAND_FINALS_RESET_DEFAULT;
      return WINNERS_DEFAULT;
    }),
    losers: new Array(losersRoundCount)
      .fill(null)
      .map((_, i) =>
        i === losersRoundCount - 1 ? LOSERS_FINALS_DEFAULT : LOSERS_DEFAULT
      ),
  };
}

export function getRoundNames(bracket: Bracket): EliminationBracket<string[]> {
  const { winners: winnersRoundCount, losers: losersRoundCount } =
    countRounds(bracket);

  return {
    winners: new Array(winnersRoundCount).fill(null).map((_, i) => {
      const isSE = bracket.losers.length === 0;
      if (i === winnersRoundCount - 4 + Number(isSE)) {
        return "Winners' Semifinals";
      }
      if (i === winnersRoundCount - 3 + Number(isSE)) return "Winners' Finals";
      if (i === winnersRoundCount - 2 + Number(isSE)) return "Grand Finals";
      if (!isSE && i === winnersRoundCount - 1) return "Bracket Reset";
      return `Winners' Round ${i + 1}`;
    }),
    losers: new Array(losersRoundCount)
      .fill(null)
      .map((_, i) =>
        i === losersRoundCount - 1 ? "Losers' Finals" : `Losers' Round ${i + 1}`
      ),
  };
}

export function countRounds(bracket: Bracket): EliminationBracket<number> {
  const isDE = bracket.losers.length > 0;
  let winners = 1 + Number(isDE);

  for (let i = bracket.participantsWithByesCount; i > 1; i /= 2) {
    winners++;
  }

  if (!isDE) return { winners, losers: 0 };

  const losersMatchIds = new Set(bracket.losers.map((match) => match.id));
  let losers = 0;
  let losersMatch = bracket.losers[0];

  while (true) {
    losers++;
    const match1 = losersMatch?.winnerDestinationMatch;
    const match2 = losersMatch?.winnerDestinationMatch;
    if (match1 && losersMatchIds.has(match1.id)) {
      losersMatch = match1;
      continue;
    } else if (match2 && losersMatchIds.has(match2.id)) {
      losersMatch = match2;
      continue;
    }

    break;
  }

  let matchesWithByes = 0;
  let matchesWithOpponent = 0;

  for (const match of bracket.winners) {
    if (!match.upperTeam) break;
    if (match.upperTeam === "BYE" || match.lowerTeam === "BYE") {
      matchesWithByes++;
      continue;
    }

    matchesWithOpponent++;
  }

  // First round of losers is not played if certain amount of byes
  if (matchesWithByes && matchesWithByes >= matchesWithOpponent) {
    losers--;
  }

  return { winners, losers };
}

/** Resolve collection of brackets to string that can be shown to user */
export function resolveTournamentFormatString(
  brackets: { type: BracketType }[]
) {
  invariant(brackets[0], "no brackets");
  return brackets[0].type === "DE"
    ? "Double Elimination"
    : "Single Elimination";
}

export function countParticipants(teams: FindTournamentByNameForUrlI["teams"]) {
  return teams.reduce((acc, team) => {
    if (!team.checkedInTime) return acc;
    invariant(
      team.members.length < TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
      `Team with id ${team.id} has too small roster: ${team.members.length}`
    );

    return acc + 1;
  }, 0);
}

interface TournamentRoundForDB {
  position: number;
  stages: {
    position: number;
    stageId: number;
  }[];
  matches: {
    id: string;
    winnerDestinationMatchId?: string;
    loserDestinationMatchId?: string;
    participants: {
      teamId: string;
      order: TeamOrder;
    };
  }[];
}
export function tournamentRoundsForDB({
  mapList,
  participantCount,
  bracketType,
}: {
  mapList: UseTournamentRoundsState["bracket"];
  participantCount: number;
  bracketType: BracketType;
}): TournamentRoundForDB[] {
  const rounds = eliminationBracket(participantCount, bracketType);
  const result: TournamentRoundForDB[] = [];

  for (const [i, side] of [rounds.winners, rounds.losers].entries()) {
    const isWinners = i === 0;
    for (const [roundI, round] of side.entries()) {
      const position = isWinners ? roundI + 1 : -(roundI + 1);

      const stagesRaw = mapList[isWinners ? "winners" : "losers"][roundI];
      invariant(stagesRaw, "stagesRaw is undefined");
      const stages = stagesRaw.mapList.map((stage, i) => ({
        position: i + 1,
        stageId: stage.id,
      }));
    }
  }

  return result;
}

export type EliminationBracket<T> = {
  winners: T;
  losers: T;
};

export type EliminationBracketSide = "winners" | "losers";
