import { Prisma, RankedMode } from "@prisma/client";
import prisma from "prisma/client";

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

export default {
  getTop500PlacementsByMonth,
  getMostRecentResult,
};
