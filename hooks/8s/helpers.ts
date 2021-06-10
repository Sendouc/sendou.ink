import { shuffleArray } from "utils/arrays";

const choosePlayersToSitOut = ({
  players,
  sittingOutCounts,
}: {
  players: Players;
  sittingOutCounts: SittingOutCounts;
}): PlayersTeam => {
  if (players.length === 8) return players as PlayersTeam;

  // TODO: cut down to 8
  return players as PlayersTeam;
};

const getAllSubsetsOfSizeFour = <T>(theArray: T[]): T[][] =>
  theArray
    .reduce(
      (subsets: T[][], value: T) =>
        subsets.concat(subsets.map((set) => [value, ...set])),
      [[]]
    )
    .filter((arr) => arr.length === 4);

const removeDuplicates = ({
  teams,
  players,
}: {
  teams: Player[][];
  players: Player[];
}): Player[][] => {
  const result: Player[][] = [];
  const existingTeams = new Set<string>();

  for (const team of teams) {
    const teamStringified = team
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => p.name)
      .join(",");
    const oppositeTeamStringified = players
      .filter((p) => team.every((member) => member.name !== p.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => p.name)
      .join(",");
    if (
      existingTeams.has(teamStringified) ||
      existingTeams.has(oppositeTeamStringified)
    ) {
      continue;
    }
    existingTeams.add(teamStringified);
    existingTeams.add(oppositeTeamStringified);

    result.push(team);
  }

  return result;
};

const removeTeamsThatAlreadyPlayed = ({
  teams,
  previousMatches,
}: {
  teams: Player[][];
  previousMatches: Match[];
}): Player[][] => {
  const result: Player[][] = [];

  console.log("previousMatches", previousMatches);

  for (const team of teams) {
    let isNewTeam = true;
    const teamSortedStringified = team
      .map((p) => p.name)
      .sort()
      .toString();
    for (const previousMatch of previousMatches) {
      for (const previousTeam of [previousMatch.alpha, previousMatch.bravo]) {
        if (previousTeam.sort().toString() === teamSortedStringified) {
          isNewTeam = false;
        }
      }
    }

    if (isNewTeam) result.push(team);
  }

  // could be smarter about this but at least prevent the crash with what should be a pretty rare case
  // to hit legit
  if (result.length === 0) return teams;

  return result;
};

const selectAlphaTeamOfBestProjectedMatchUp = ({
  teams,
  players,
}: {
  teams: Player[][];
  players: Player[];
}): Player[] => {
  let result = teams[0];
  let bestDifference = Infinity;
  for (const alphaTeam of teams) {
    const bravoTeam = players.filter(
      (p) =>
        !alphaTeam.some((alphaTeamPlayer) => alphaTeamPlayer.name === p.name)
    );

    const alphaTeamAverageScore = alphaTeam.reduce(
      (acc, cur) => acc + cur.winCount - cur.lossCount,
      0
    );
    const bravoTeamAverageScore = bravoTeam.reduce(
      (acc, cur) => acc + cur.winCount - cur.lossCount,
      0
    );

    const currentDifference = Math.abs(
      alphaTeamAverageScore - bravoTeamAverageScore
    );

    if (bestDifference > currentDifference) {
      bestDifference = currentDifference;
      result = alphaTeam;
    }

    if (bestDifference === 0) {
      break;
    }
  }
  return result;
};

export const createNewMatch = ({
  players,
  previousMatches,
  sittingOutCounts,
}: {
  players: Players;
  previousMatches: Match[];
  sittingOutCounts: SittingOutCounts;
}): Match => {
  // TODO: who sits out has to also be recorded
  const playersForMatch = shuffleArray(
    choosePlayersToSitOut({ players, sittingOutCounts })
  );
  let teams = getAllSubsetsOfSizeFour(playersForMatch);
  teams = removeDuplicates({ teams, players: playersForMatch });
  teams = removeTeamsThatAlreadyPlayed({ teams, previousMatches });

  const alpha = selectAlphaTeamOfBestProjectedMatchUp({
    teams,
    players: playersForMatch,
  }).map((p) => p.name);
  const bravo = playersForMatch
    .filter((player) => !alpha.includes(player.name))
    .map((p) => p.name);
  return { alpha, bravo };
};

export const teamsShouldChange = ({
  matchesLength,
  amountOfRoundsWithSameTeams,
}: {
  matchesLength: number;
  amountOfRoundsWithSameTeams: number;
}) => {
  return matchesLength % amountOfRoundsWithSameTeams === 0;
};
