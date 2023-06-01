import invariant from "tiny-invariant";
import type { FindAllMatchesByTournamentIdMatch } from "../queries/findAllMatchesByTournamentId.server";

// TODO: this only works for double elimination
export function resolveBestOfs(
  matches: Array<FindAllMatchesByTournamentIdMatch>
) {
  // 3 is default
  const result: [bestOf: 5 | 7, id: number][] = [];

  // special case: only 2 teams
  if (matches.length === 1) {
    result.push([7, matches[0]!.matchId]);
    return result;
  }

  /// Best of 7

  // 1) Grand Finals
  // 2) Bracket reset

  const finalsMatches = matches.filter((match) => match.groupNumber === 3);

  invariant(finalsMatches.length === 2, "finalsMatches must be 2");
  result.push([7, finalsMatches[0]!.matchId]);
  result.push([7, finalsMatches[1]!.matchId]);

  /// Best of 5

  // 1) All rounds of Winners except the first two, Grand Finals and Bracket Reset.

  const bestOfFiveWinnersRounds = matches.filter(
    (match) =>
      match.groupNumber === 1 &&
      match.roundNumber > 2 &&
      !finalsMatches.some(
        (finalsMatch) => finalsMatch.matchId === match.matchId
      )
  );

  for (const match of bestOfFiveWinnersRounds) {
    result.push([5, match.matchId]);
  }

  // 2) Losers Finals.

  const maxLosersRoundNumber = Math.max(
    ...matches
      .filter((match) => match.groupNumber === 2)
      .map((match) => match.roundNumber)
  );

  const losersFinals = matches.filter(
    (match) =>
      match.roundNumber === maxLosersRoundNumber && match.groupNumber === 2
  );
  invariant(losersFinals.length === 1, "losersFinals must be 1");

  result.push([5, losersFinals[0]!.matchId]);

  return result;
}
