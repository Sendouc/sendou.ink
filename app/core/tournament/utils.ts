export const checkInHasStarted = (checkInStartTime: string) =>
  new Date(checkInStartTime) < new Date();

export const sortTeamsBySeed =
  (seeds: string[]) =>
  (
    a: { id: string; createdAt: string | Date },
    b: { id: string; createdAt: string | Date }
  ) => {
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
