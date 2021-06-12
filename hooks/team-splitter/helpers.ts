import { shuffleArray } from "utils/arrays";

const choosePlayersToSitOut = (
  players: Player[]
): [playingRoster: Player[], spectators: Player[]] => {
  if (players.length === 8) return [players, []];

  console.log("players", players);

  const playersCopySorted = [...players].sort(
    (a, b) => a.sittingOutCount - b.sittingOutCount
  );

  const playingRoster: Player[] = [];
  const spectators: Player[] = [];

  for (const [i, player] of playersCopySorted.entries()) {
    if (i === 0) spectators.push(player);
    else if (i === 1 && playersCopySorted.length === 10) {
      spectators.push(player);
    } else {
      playingRoster.push(player);
    }
  }

  return [playingRoster, spectators];
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

const removeTeamsWherePlayersShouldNotBeInTheSameTeam = ({
  teams,
  noPlacingToSameTeam,
  players,
}: {
  teams: Player[][];
  noPlacingToSameTeam: [playerOneId?: number, playerTwoId?: number];
  players: Player[];
}): Player[][] => {
  if (noPlacingToSameTeam.length !== 2) return teams;

  // Check if one or both of the unpreferred players are spectating
  if (
    players.reduce(
      (count, player) =>
        noPlacingToSameTeam.includes(player.id) ? count + 1 : count,
      0
    ) !== 2
  ) {
    return teams;
  }
  // If count is not one it means the unpreferred players are either both in this team (count 2)
  // or in the other team (count 2)
  return teams.filter(
    (t) =>
      t.reduce(
        (count, player) =>
          noPlacingToSameTeam.includes(player.id) ? count + 1 : count,
        0
      ) === 1
  );
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
  noPlacingToSameTeam,
}: {
  players: Player[];
  previousMatches: Match[];
  noPlacingToSameTeam: [playerOneId?: number, playerTwoId?: number];
}): Match => {
  // TODO: who sits out has to also be recorded
  const [playersForMatch, spectators] = choosePlayersToSitOut(
    shuffleArray(players)
  );
  let teams = getAllSubsetsOfSizeFour(playersForMatch);
  teams = removeDuplicates({ teams, players: playersForMatch });
  teams = removeTeamsThatAlreadyPlayed({ teams, previousMatches });
  teams = removeTeamsWherePlayersShouldNotBeInTheSameTeam({
    teams,
    noPlacingToSameTeam,
    players: playersForMatch,
  });

  const alpha = selectAlphaTeamOfBestProjectedMatchUp({
    teams,
    players: playersForMatch,
  }).map((p) => p.name);
  const bravo = playersForMatch
    .filter((player) => !alpha.includes(player.name))
    .map((p) => p.name);
  return { alpha, bravo, spectators: spectators.map((s) => s.name) };
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

export const errorWithPlayers = (players: Player[]) => {
  const playerNames = players
    .map((p) => p.name.trim())
    .filter((name) => name !== "");
  if (playerNames.length < 8) return "Please enter at least 8 player names";

  const uniqueNames = new Set(playerNames.map((name) => name.toUpperCase()));
  if (uniqueNames.size !== playerNames.length)
    return "Every name has to be unique";

  return "";
};
