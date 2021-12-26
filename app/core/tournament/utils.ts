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

export function tournamentHasStarted(
  brackets: {
    rounds: {
      position: number;
    }[];
  }[]
) {
  return brackets[0].rounds.length > 0;
}

export const friendCodeRegExpString = "^(SW-)?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$";
export const friendCodeRegExp = new RegExp(friendCodeRegExpString, "i");
