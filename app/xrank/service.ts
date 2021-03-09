import { Prisma, RankedMode } from "@prisma/client";
import prisma from "prisma/client";

export type XTrends = Prisma.PromiseReturnType<typeof getXTrends>;

const getXTrends = async () => {
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

export type Top500PlacementsByMonth = Prisma.PromiseReturnType<
  typeof getTop500PlacementsByMonth
>;

const getTop500PlacementsByMonth = async ({
  month,
  year,
  mode,
}: {
  month: number;
  year: number;
  mode: RankedMode;
}) => {
  return prisma.xRankPlacement.findMany({
    where: { month, year, mode },
    orderBy: { ranking: "asc" },
    select: {
      playerName: true,
      xPower: true,
      ranking: true,
      switchAccountId: true,
      weapon: true,
      player: {
        include: {
          user: {
            select: {
              discordId: true,
              discordAvatar: true,
              discriminator: true,
              username: true,
              profile: { select: { customUrlPath: true } },
            },
          },
        },
      },
    },
  });
};

export type MostRecentResult = Prisma.PromiseReturnType<
  typeof getMostRecentResult
>;

const getMostRecentResult = () => {
  return prisma.xRankPlacement.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
};

export default { getXTrends, getTop500PlacementsByMonth, getMostRecentResult };
