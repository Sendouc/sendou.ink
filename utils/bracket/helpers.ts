import { EliminationMatch } from "./Bracket";

const changeIntoBye = (seed: number, participantsCount: number) => {
  return seed <= participantsCount ? seed : undefined;
};

const getFirstRoundSeeds = (
  participantsCount: number
): (number | undefined)[][] => {
  const rounds = Math.ceil(Math.log(participantsCount) / Math.log(2));
  if (participantsCount < 2) {
    return [];
  }

  let matches: (number | undefined)[][] = [[1, 2]];

  for (let round = 1; round < rounds; round++) {
    const roundMatches = [];
    const sum = Math.pow(2, round + 1) + 1;

    for (let i = 0; i < matches.length; i++) {
      const top = matches[i][0];
      if (!top) {
        throw Error("unexpected no top");
      }
      let home = changeIntoBye(top, participantsCount);
      let away = changeIntoBye(sum - top, participantsCount);
      roundMatches.push([home, away]);

      const bottom = matches[i][1];
      if (!bottom) {
        throw Error("unexpected no bottom");
      }
      home = changeIntoBye(sum - bottom, participantsCount);
      away = changeIntoBye(bottom, participantsCount);
      roundMatches.push([home, away]);
    }
    matches = roundMatches;
  }

  return matches;
};

export const matchesSingleElim = (teams: string[]): EliminationMatch[][] => {
  const firstRoundSeeds = getFirstRoundSeeds(teams.length);
  const amountOfRounds = firstRoundSeeds.length;
  const result: EliminationMatch[][] = [];

  // Generate match objects

  let matchId = 1;

  for (
    let matchesInRound = 1;
    matchesInRound <= amountOfRounds;
    matchesInRound = matchesInRound * 2
  ) {
    const roundArray = [];
    let destinationMatchIndex = 0;
    for (let i = 1; i <= matchesInRound; i++) {
      roundArray.push(
        new EliminationMatch({
          winnerDestination:
            result.length > 0
              ? [
                  result[0][destinationMatchIndex],
                  i % 2 === 0 ? "bottom" : "top",
                ]
              : undefined,
          id: ++matchId,
        })
      );

      if (i % 2 === 0) {
        destinationMatchIndex++;
      }
    }

    result.unshift(roundArray);
  }

  // Place teams in the first round

  for (const [index, round] of firstRoundSeeds.entries()) {
    const topTeam = round[0]
      ? { name: teams[round[0] - 1], seed: round[0] }
      : undefined;
    const bottomTeam = round[1]
      ? { name: teams[round[1] - 1], seed: round[1] }
      : undefined;

    result[0][index].setTeams({ topTeam, bottomTeam });
  }

  // Advance teams to second round if they don't have opponent in the first round

  for (const match of result[0]) {
    if (!match.winnerDestination) {
      throw Error("unexpected no winner destination");
    }

    if (!match.topTeam && match.bottomTeam) {
      match.winnerDestination[0].setTeams({
        [match.winnerDestination[1] === "top"
          ? "topTeam"
          : "bottomTeam"]: match.bottomTeam,
      });
    }

    if (!match.bottomTeam && match.topTeam) {
      match.winnerDestination[0].setTeams({
        [match.winnerDestination[1] === "top"
          ? "topTeam"
          : "bottomTeam"]: match.topTeam,
      });
    }
  }

  // Mark no ancestors for rendering

  for (const match of result[1]) {
    if (match.topTeam && match.bottomTeam) match.noAncestors = true;
  }

  return result;
};
