import { RankedMode } from ".prisma/client";
import prisma from "prisma/client";
import { truncuateFloat } from "utils/numbers";
import { Unpacked } from "utils/types";

export type XTrends = Record<
  RankedMode,
  {
    weapon: string;
    count: number;
    percentage: number;
    averageXp: number;
    progress: "UP" | "DOWN" | "SAME";
  }[]
>;

const getXTrends = async (): Promise<XTrends> => {
  const placements = await prisma.xRankPlacement.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    // amount of placements in top 500 * amount of months we want * amount of modes
    take: 500 * 4 * 4,
  });

  const referenceMonths = placements.slice(0, 500 * 4 * 3);
  const lastThreeMonths = placements.slice(500 * 4);

  const weaponXPowersGrouped = (
    acc: Record<RankedMode, Record<string, number[]>>,
    placement: Unpacked<typeof placements>
  ) => {
    if (!acc[placement.mode][placement.weapon]) {
      acc[placement.mode][placement.weapon] = [];
    }

    acc[placement.mode][placement.weapon].push(placement.xPower);

    return acc;
  };

  const referenceWeaponsCounts = referenceMonths.reduce(weaponXPowersGrouped, {
    SZ: {},
    TC: {},
    RM: {},
    CB: {},
  });
  const lastThreeMonthsWeaponCounts = lastThreeMonths.reduce(
    weaponXPowersGrouped,
    {
      SZ: {},
      TC: {},
      RM: {},
      CB: {},
    }
  );

  return (["SZ", "TC", "RM", "CB"] as const).reduce(
    (acc: XTrends, mode: RankedMode) => {
      acc[mode] = Object.entries(lastThreeMonthsWeaponCounts[mode])
        .map(([weapon, xPowers]) => {
          const previousCount =
            referenceWeaponsCounts[mode][weapon]?.length ?? 0;
          return {
            weapon,
            count: xPowers.length,
            percentage: truncuateFloat(
              (xPowers.length / (lastThreeMonths.length / 4)) * 100
            ),
            averageXp: truncuateFloat(
              xPowers.reduce((a, b) => a + b) / xPowers.length
            ),
            progress:
              previousCount === xPowers.length
                ? ("SAME" as const)
                : previousCount > xPowers.length
                ? ("DOWN" as const)
                : ("UP" as const),
          };
        })
        .sort((a, b) => {
          if (a.count !== b.count) return b.count - a.count;

          return b.averageXp - a.averageXp;
        });

      return acc;
    },
    { SZ: [], TC: [], RM: [], CB: [] }
  );
};

const xTrendsService = {
  getXTrends,
};

export default xTrendsService;
