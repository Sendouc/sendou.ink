import { weaponsWithHero } from "lib/lists/weaponsWithHero";
import { GetBuildsByUserData } from "prisma/queries/getBuildsByUser";
import { useState } from "react";
import useSWR from "swr";

export function useBuildsByUser(userId?: number, weaponPool?: string[]) {
  const [weapon, setWeapon] = useState<string | null>(null);

  const { data = [] } = useSWR<GetBuildsByUserData>(
    userId ? `/api/users/${userId}/builds` : null
  );

  const weaponCounts = data.reduce((acc: [string, number][], build) => {
    const foundTuple = acc.find((tuple) => tuple[0] === build.weapon);
    if (foundTuple) {
      foundTuple[1] = foundTuple[1] + 1;
      return acc;
    }

    acc.push([build.weapon, 1]);
    return acc;
  }, []);

  const sortedBuilds = data.sort((a, b) => {
    // 1) sort by the order in weapon pool
    const pool = weaponPool ?? [];
    const aPoolIndex = pool.includes(a.weapon)
      ? pool.indexOf(a.weapon)
      : Infinity;
    const bPoolIndex = pool.includes(b.weapon)
      ? pool.indexOf(b.weapon)
      : Infinity;

    if (aPoolIndex !== bPoolIndex) return aPoolIndex - bPoolIndex;

    // 2) sort by the order in-game
    const aInGameOrderIndex = weaponsWithHero.indexOf(a.weapon as any);
    const bInGameOrderIndex = weaponsWithHero.indexOf(b.weapon as any);

    if (aInGameOrderIndex !== bInGameOrderIndex) {
      return aInGameOrderIndex - bInGameOrderIndex;
    }

    // 3) if same weapon but different title sort by title
    if ((a.title ?? "").localeCompare(b.title ?? "") !== 0) {
      return (a.title ?? "").localeCompare(b.title ?? "");
    }

    // 4) sort by creation time
    return a.updatedAt.getTime() - b.updatedAt.getTime();
  });

  return {
    data: weapon
      ? sortedBuilds.filter((build) => build.weapon === weapon)
      : sortedBuilds,
    weaponCounts,
    setWeapon,
    buildCount: data.length,
  };
}
