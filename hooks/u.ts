import { GetBuildsByUserData } from "prisma/queries/getBuildsByUser";
import { useState } from "react";
import useSWR from "swr";

export function useBuildsByUser(userId?: number) {
  const [weapon, setWeapon] = useState<string | null>(null);

  const { data = [] } = useSWR<GetBuildsByUserData>(
    `/api/users/${userId}/builds`
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

  return {
    data: weapon ? data.filter((build) => build.weapon === weapon) : data,
    weaponCounts,
    setWeapon,
    buildCount: data.length,
  };
}
