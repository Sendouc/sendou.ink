import type { BracketType, Stage, TeamOrder } from ".prisma/client";
import clone from "just-clone";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "../../constants";
import { FindTournamentByNameForUrlI } from "../../services/tournament";
import { Bracket, eliminationBracket, Match } from "./algorithms";
import { generateMapListForRounds } from "./mapList";

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

export function winnersRoundNames(count: number, isSE: boolean) {
  return new Array(count).fill(null).map((_, i) => {
    if (i === count - 4 + Number(isSE)) {
      return "Winners' Semifinals";
    }
    if (i === count - 3 + Number(isSE)) return "Winners' Finals";
    if (i === count - 2 + Number(isSE)) return "Grand Finals";
    if (!isSE && i === count - 1) return "Bracket Reset";
    return `Winners' Round ${i + 1}`;
  });
}

export function losersRoundNames(count: number) {
  return new Array(count)
    .fill(null)
    .map((_, i) =>
      i === count - 1 ? "Losers' Finals" : `Losers' Round ${i + 1}`
    );
}

export function getRoundNames(bracket: Bracket): EliminationBracket<string[]> {
  const { winners: winnersRoundCount, losers: losersRoundCount } =
    countRounds(bracket);

  return {
    winners: winnersRoundNames(winnersRoundCount, losersRoundCount === 0),
    losers: losersRoundNames(losersRoundCount),
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

export type MapListIds = z.infer<typeof MapListIdsSchema>;
export const MapListIdsSchema = z.object({
  winners: z.array(z.array(z.object({ id: z.number() }))),
  losers: z.array(z.array(z.object({ id: z.number() }))),
});

export interface TournamentRoundForDB {
  id: string;
  position: number;
  stages: {
    position: number;
    stageId: number;
  }[];
  matches: {
    id: string;
    number: number;
    winnerDestinationMatchId?: string;
    loserDestinationMatchId?: string;
    participants: {
      team: { id: string } | "BYE";
      order: TeamOrder;
    }[];
  }[];
}
export function tournamentRoundsForDB({
  mapList,
  bracketType,
  participantsSeeded,
}: {
  mapList: MapListIds;
  bracketType: BracketType;
  participantsSeeded: { id: string }[];
}): TournamentRoundForDB[] {
  const bracket = eliminationBracket(participantsSeeded.length, bracketType);
  const result: TournamentRoundForDB[] = [];

  const groupedRounds = advanceByes(groupMatchesByRound(bracket));

  for (const [sideI, side] of [
    groupedRounds.winners,
    groupedRounds.losers,
  ].entries()) {
    const isWinners = sideI === 0;
    for (const [roundI, round] of side.entries()) {
      const position = isWinners ? roundI + 1 : -(roundI + 1);
      const stagesRaw = mapList[isWinners ? "winners" : "losers"][roundI];
      invariant(stagesRaw, "stagesRaw is undefined");
      const stages = stagesRaw.map((stage, i) => ({
        position: i + 1,
        stageId: stage.id,
      }));

      const matches = round.map((match) => {
        return {
          id: match.id,
          number: match.number,
          winnerDestinationMatchId: match.winnerDestinationMatch?.id,
          loserDestinationMatchId: match.loserDestinationMatch?.id,
          participants: [match.upperTeam, match.lowerTeam].flatMap(
            (team, i) => {
              if (!team) return [];
              const teamOrBye =
                team === "BYE"
                  ? team
                  : { id: participantsSeeded[team - 1]?.id };
              invariant(
                typeof teamOrBye === "string" || teamOrBye?.id,
                `teamId is undefined - participantsSeeded: ${participantsSeeded.join(
                  ","
                )}; team: ${team}`
              );

              return {
                team: teamOrBye,
                order: i === 0 ? "UPPER" : ("LOWER" as TeamOrder),
              };
            }
          ),
        };
      });

      result.push({
        id: uuidv4(),
        position,
        stages,
        matches,
      });
    }
  }

  return result;
}

function groupMatchesByRound(bracket: Bracket): EliminationBracket<Match[][]> {
  const { winners, losers } = countRounds(bracket);

  const result: EliminationBracket<Match[][]> = {
    winners: new Array(winners).fill(null).map(() => []),
    losers: new Array(losers).fill(null).map(() => []),
  };
  const matchesIncluded = new Set<string>();
  for (const match of bracket.winners) {
    // first round match
    if (match.upperTeam && match.lowerTeam) {
      search(match, "winners", 1);
      search(match.loserDestinationMatch, "losers", 1);
    }
  }

  invariant(
    matchesIncluded.size === bracket.winners.length + bracket.losers.length,
    `matchesIncluded: ${matchesIncluded.size}; winners: ${bracket.winners.length}; losers: ${bracket.losers.length}`
  );
  return result;

  function search(
    match: Match | undefined,
    side: EliminationBracketSide,
    depth: number
  ) {
    if (!match) return;
    if (matchesIncluded.has(match.id)) return;

    search(match.winnerDestinationMatch, side, depth + 1);
    matchesIncluded.add(match.id);
    result[side][depth - 1]?.push(match);
  }
}

function advanceByes(
  rounds_: EliminationBracket<Match[][]>
): EliminationBracket<Match[][]> {
  const result = clone(rounds_);

  const teamsForSecondRound = new Map<
    number,
    ["upperTeam" | "lowerTeam", number]
  >();
  for (const round of result.winners[0]) {
    const winnerDestinationMatch = round.winnerDestinationMatch;
    invariant(winnerDestinationMatch, "winnerDestinationmatch is undefined");

    if (
      round.upperTeam &&
      round.upperTeam !== "BYE" &&
      round.lowerTeam === "BYE"
    ) {
      teamsForSecondRound.set(winnerDestinationMatch.number, [
        resolveSide(round, winnerDestinationMatch, result),
        round.upperTeam,
      ]);
    } else if (
      round.lowerTeam &&
      round.lowerTeam !== "BYE" &&
      round.upperTeam === "BYE"
    ) {
      teamsForSecondRound.set(winnerDestinationMatch.number, [
        resolveSide(round, winnerDestinationMatch, result),
        round.lowerTeam,
      ]);
    }
  }

  for (const [i, round] of result.winners[1].entries()) {
    const teamForSecondRound = teamsForSecondRound.get(round.number);
    if (!teamForSecondRound) continue;

    const [key, teamNumber] = teamForSecondRound;
    result.winners[1][i] = { ...result.winners[1][i], [key]: teamNumber };
  }

  return result;
}

function resolveSide(
  currentMatch: Match,
  destinationMatch: Match,
  rounds: EliminationBracket<Match[][]>
): "upperTeam" | "lowerTeam" {
  const matchNumbers = getWinnerDestinationMatchIdToMatchNumbers(rounds).get(
    destinationMatch.id
  );
  console.log(matchNumbers);
  const otherNumber = matchNumbers?.find((num) => num !== currentMatch.number);
  invariant(
    otherNumber,
    `no otherNumber; matchNumbers length is not 2 was: ${matchNumbers?.length}`
  );

  if (otherNumber > currentMatch.number) return "upperTeam";
  return "lowerTeam";
}

function getWinnerDestinationMatchIdToMatchNumbers(
  rounds: EliminationBracket<Match[][]>
): Map<string, number[]> {
  return rounds.winners[0].reduce((map, round) => {
    invariant(
      round.winnerDestinationMatch,
      "round.winnerDestinationMatch is undefined"
    );
    if (!map.has(round.winnerDestinationMatch.id)) {
      return map.set(round.winnerDestinationMatch.id, [round.number]);
    }

    const arr = map.get(round.winnerDestinationMatch.id);
    invariant(arr, "arr is undefined");
    arr.push(round.number);

    return map;
  }, new Map<string, number[]>());
}

export type EliminationBracket<T> = {
  winners: T;
  losers: T;
};

export type EliminationBracketSide = "winners" | "losers";
