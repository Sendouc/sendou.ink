import { GetAllLadderRegisteredTeamsForMatchesData } from "prisma/queries/getAllLadderRegisteredTeamsForMatches";
import { quality, Rating } from "ts-trueskill";

type TeamsWithRanking = {
  id: number;
  roster: {
    id: number;
    rating: Rating;
  }[];
};

export const getLadderRounds = (
  registeredTeams: GetAllLadderRegisteredTeamsForMatchesData
) => {
  if (registeredTeams.length < 4) {
    throw Error("registeredTeams length less than 4");
  }
  const teamsWithRanking: TeamsWithRanking[] = registeredTeams.map(
    (registeredTeam) => ({
      id: registeredTeam.id,
      roster: registeredTeam.roster.map((user) => ({
        id: user.id,
        rating: user.trueSkill
          ? new Rating(user.trueSkill.mu, user.trueSkill.sigma)
          : new Rating(),
      })),
    })
  );

  // this chooses the teams to sit out each round if uneven number of teams
  // if even it just returns `teamsWithRanking` in both 0 index and 1 index
  const [teamsRoundOne, teamsRoundTwo] = getTeamsForRounds();

  // helper variable accessed from generatePairings
  let bestPairs: TeamsWithRanking[][] | undefined;
  // helper variable accessed from generatePairings
  let bestAverageQuality = Infinity;

  // first round matches actual
  let firstRound: TeamsWithRanking[][] | undefined;

  generatePairings(teamsRoundOne, 0);

  firstRound = bestPairs;
  bestAverageQuality = -Infinity;

  generatePairings(teamsRoundTwo, 0);

  if (!firstRound || !bestPairs || firstRound === bestPairs) {
    throw Error("unexpected falsy firstROund or bestPairs");
  }

  return [firstRound, bestPairs];

  // https://stackoverflow.com/a/37449857
  // start is the current position in the list, advancing by 2 each time
  // pass 0 as start when calling at the top level
  function generatePairings(items: TeamsWithRanking[], start: number) {
    if (items.length % 2 !== 0) {
      throw Error("uneven number of teams in generatePairings");
    }

    // is this a complete pairing?
    if (start === items.length) {
      if (hasDuplicatePairing()) {
        return;
      }

      let qualitySum = 0;
      for (let i = 0; i < items.length; i += 2) {
        const teamAlpha = items[i].roster.map((user) => user.rating);
        const teamBravo = items[i + 1].roster.map((user) => user.rating);

        qualitySum += quality([teamAlpha, teamBravo]);
      }

      qualitySum /= items.length / 2;
      if (qualitySum > bestAverageQuality) {
        bestAverageQuality = qualitySum;
        bestPairs = items
          .map((team, i) => (i % 2 !== 0 ? null : [team, items[i + 1]]))
          .filter((team) => team) as TeamsWithRanking[][];
      }

      return;
    }

    // for the next pair, choose the first element in the list for the
    // first item in the pair (meaning we don't have to do anything
    // but leave it in place), and each of the remaining elements for
    // the second item:
    for (let j = start + 1; j < items.length; j++) {
      // swap start+1 and j:
      let temp = items[start + 1];
      items[start + 1] = items[j];
      items[j] = temp;

      // recurse:
      generatePairings(items, start + 2);

      // swap them back:
      temp = items[start + 1];
      items[start + 1] = items[j];
      items[j] = temp;
    }

    function hasDuplicatePairing() {
      if (!firstRound) return false;

      for (let i = 0; i < items.length; i += 2) {
        const teamAlpha = items[i];
        const teamBravo = items[i + 1];

        if (
          firstRound.some(
            ([pairsAlpha, pairsBravo]) =>
              (pairsAlpha.id === teamAlpha.id &&
                pairsBravo.id === teamBravo.id) ||
              (pairsAlpha.id === teamBravo.id && pairsBravo.id === teamAlpha.id)
          )
        ) {
          return true;
        }
      }

      return false;
    }
  }

  function getTeamsForRounds() {
    if (teamsWithRanking.length % 2 === 0)
      return [teamsWithRanking, teamsWithRanking];

    const firstTeamToSitOut = randomChoiceIndex();
    let secondTeamToSitOut = randomChoiceIndex();
    while (secondTeamToSitOut === firstTeamToSitOut) {
      secondTeamToSitOut = randomChoiceIndex();
    }

    return [
      teamsWithRanking.filter((_, i) => i !== firstTeamToSitOut),
      teamsWithRanking.filter((_, i) => i !== secondTeamToSitOut),
    ];

    function randomChoiceIndex() {
      return Math.floor(Math.random() * teamsWithRanking.length);
    }
  }
};
