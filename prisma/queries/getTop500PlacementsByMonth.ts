import { PrismaClient, RankedMode } from "@prisma/client";
import { Unwrap } from "lib/types";

export type GetTop500PlacementsByMonthData = Unwrap<
  ReturnType<typeof getTop500PlacementsByMonth>
>;

export const getTop500PlacementsByMonth = async ({
  prisma,
  month,
  year,
  mode,
}: {
  prisma: PrismaClient;
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
