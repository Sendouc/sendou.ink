import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetXTrendsData = Prisma.PromiseReturnType<typeof getXTrends>;

export const getXTrends = async () => {
  const placements = await prisma.xRankPlacement.findMany({
    select: { mode: true, month: true, year: true, weapon: true, xPower: true },
  });

  const result: {
    [year: string]: {
      [month: string]: {
        [weapon: string]: {
          SZ?: { xPowerAverage: number; count: number };
          TC?: { xPowerAverage: number; count: number };
          RM?: { xPowerAverage: number; count: number };
          CB?: { xPowerAverage: number; count: number };
        };
      };
    };
  } = {};

  placements.forEach((placement) => {
    if (!result[placement.year]) result[placement.year] = {};
    if (!result[placement.year][placement.month]) {
      result[placement.year][placement.month] = {};
    }
    if (!result[placement.year][placement.month][placement.weapon]) {
      result[placement.year][placement.month][placement.weapon] = {};
    }

    const weaponObj = result[placement.year][placement.month][placement.weapon][
      placement.mode
    ] ?? { xPowerAverage: 0, count: 0 };

    const previousAverage = weaponObj.xPowerAverage;
    const previousCount = weaponObj.count;

    weaponObj.xPowerAverage =
      (previousAverage * previousCount + placement.xPower) /
      (previousCount + 1);
    weaponObj.count++;

    result[placement.year][placement.month][placement.weapon][
      placement.mode
    ] = weaponObj;
  });

  return result;
};
