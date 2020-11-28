import { Prisma, RankedMode } from "@prisma/client";
import prisma from "prisma/client";

export type GetTop500PlacementsByMonthData = Prisma.PromiseReturnType<
  typeof getTop500PlacementsByMonth
>;

export const getTop500PlacementsByMonth = async ({
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
