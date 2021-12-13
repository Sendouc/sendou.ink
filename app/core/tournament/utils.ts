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
