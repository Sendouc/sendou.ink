import { BracketType } from ".prisma/client";
import invariant from "tiny-invariant";
import { Bracket } from "./bracket";

export function checkInHasStarted(checkInStartTime: string) {
  return new Date(checkInStartTime) < new Date();
}

export function sortTeamsBySeed(seeds: string[]) {
  return function (
    a: { id: string; createdAt: string | Date },
    b: { id: string; createdAt: string | Date }
  ) {
    const aSeed = seeds.indexOf(a.id);
    const bSeed = seeds.indexOf(b.id);

    // if one team doesn't have seed and the other does
    // the one with the seed takes priority
    if (aSeed === -1 && bSeed !== -1) return 1;
    if (aSeed !== -1 && bSeed === -1) return -1;

    // if both teams are unseeded the one who registered
    // first gets to be seeded first as well
    if (aSeed === -1 && bSeed === -1) {
      return Number(a.createdAt) - Number(b.createdAt);
    }

    // finally, consider the seeds
    return aSeed - bSeed;
  };
}

export function roundNamesWithDefaultBestOf(bracket: Bracket): {
  winners: {
    name: string;
    bestOf: number;
  }[];
  losers: {
    name: string;
    bestOf: number;
  }[];
} {
  const { winners: winnersRoundNames, losers: losersRoundNames } =
    roundNames(bracket);
  const { winners: winnersDefaultBestOf, losers: losersDefaultBestOf } =
    roundDefaultBestOf(bracket);

  invariant(
    winnersRoundNames.length === winnersDefaultBestOf.length,
    "Unexpected different length with winnersRoundNames and winnersDefaultBestOf"
  );
  invariant(
    losersRoundNames.length === losersDefaultBestOf.length,
    "Unexpected different length with losersRoundNames and losersDefaultBestOf"
  );

  return {
    winners: winnersRoundNames.map((roundName, i) => {
      const bestOf = winnersDefaultBestOf[i];
      return {
        name: roundName,
        bestOf,
      };
    }),
    losers: losersRoundNames.map((roundName, i) => {
      const bestOf = losersDefaultBestOf[i];
      return {
        name: roundName,
        bestOf,
      };
    }),
  };
}

const WINNERS_DEFAULT = 5;
const WINNERS_FIRST_TWO_DEFAULT = 3;
const GRAND_FINALS_DEFAULT = 7;
const LOSERS_DEFAULT = 3;
const LOSERS_FINALS_DEFAULT = 5;

function roundDefaultBestOf(bracket: Bracket): {
  winners: number[];
  losers: number[];
} {
  const { winners: winnersRoundCount, losers: losersRoundCount } =
    countRounds(bracket);

  return {
    winners: new Array(winnersRoundCount).fill(null).map((_, i) => {
      if (i === 0) return WINNERS_FIRST_TWO_DEFAULT;
      if (i === 1) return WINNERS_FIRST_TWO_DEFAULT;
      if (i === winnersRoundCount - 1) return GRAND_FINALS_DEFAULT;
      return WINNERS_DEFAULT;
    }),
    losers: new Array(losersRoundCount)
      .fill(null)
      .map((_, i) =>
        i === losersRoundCount - 1 ? LOSERS_FINALS_DEFAULT : LOSERS_DEFAULT
      ),
  };
}

function roundNames(bracket: Bracket): {
  winners: string[];
  losers: string[];
} {
  const { winners: winnersRoundCount, losers: losersRoundCount } =
    countRounds(bracket);

  return {
    winners: new Array(winnersRoundCount).fill(null).map((_, i) => {
      if (i === winnersRoundCount - 3) return "Winners' Semifinals";
      if (i === winnersRoundCount - 2) return "Winners' Finals";
      if (i === winnersRoundCount - 1) return "Grand Finals";
      return `Winners' Round ${i + 1}`;
    }),
    losers: new Array(losersRoundCount)
      .fill(null)
      .map((_, i) =>
        i === losersRoundCount - 1 ? "Losers' Finals" : `Losers' Round ${i + 1}`
      ),
  };
}

export function countRounds(bracket: Bracket): {
  winners: number;
  losers: number;
} {
  let winners = 1;

  for (let i = bracket.participantsWithByesCount; i > 1; i /= 2) {
    winners++;
  }

  const losersMatchIds = new Set(bracket.losers.map((match) => match.id));
  let losers = 0;
  let losersMatch = bracket.losers[bracket.losers.length - 1];

  while (true) {
    losers++;
    const match1 = losersMatch.match1;
    const match2 = losersMatch.match2;
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
  invariant(brackets.length > 0, "Unexpected no brackets");
  return brackets[0].type === "DE"
    ? "Double Elimination"
    : "Single Elimination";
}
