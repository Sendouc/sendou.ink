import { rate as openskillRate } from "openskill";
import type { Team } from "openskill/dist/types";
import invariant from "tiny-invariant";

const TAU = 0.3;

export function ordinalToSp(ordinal: number) {
  return toTwoDecimals(ordinal * 15 + 1000);
}

export function ordinalToRoundedSp(ordinal: number) {
  return Math.floor(ordinalToSp(ordinal));
}

function toTwoDecimals(value: number) {
  return Number(value.toFixed(2));
}

export function rate(teams: Team[], secondaryTeams?: Team[]) {
  if (secondaryTeams) return rateConservative(teams, secondaryTeams);

  return openskillRate(teams, { tau: TAU, preventSigmaIncrease: true });
}

// when ranking teams we rate the team against the actual team rating that it played against
// as well as against the average ratings of the players on the team
// then they get the bigger boost of the two (if won) or the smaller penalty of the two (if lost)
// this is to avoid situations where teams might unexpectedly lose a huge amount of points
// due to other team score not being accurate (not enough games played) to their perceived skill level
function rateConservative(teams: Team[], secondaryTeams: Team[]) {
  const ordinaryRating = openskillRate(teams, {
    tau: TAU,
    preventSigmaIncrease: true,
  });

  const conservativeRatingForLoser = openskillRate(
    [secondaryTeams[0], teams[1]],
    {
      tau: TAU,
      preventSigmaIncrease: true,
    }
  );

  const conservativeRatingForWinner = openskillRate(
    [teams[0], secondaryTeams[1]],
    {
      tau: TAU,
      preventSigmaIncrease: true,
    }
  );

  // [0] = higher rank of ordinaryRanking[0] and conservativeRatingForWinner[0]
  // [1] = higher rank of ordinaryRanking[1] and conservativeRatingForLoser[1]
}

export function userIdsToIdentifier(userIds: number[]) {
  invariant(userIds.length === 4, "userIds for identifier must be length 4");
  return [...userIds].sort((a, b) => a - b).join("-");
}
