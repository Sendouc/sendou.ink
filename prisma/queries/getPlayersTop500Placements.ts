import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetPlayersTop500Placements = Prisma.PromiseReturnType<
  typeof getPlayersTop500Placements
>;

export const getPlayersTop500Placements = async (switchAccountId: string) => {
  const player = await prisma.player.findUnique({
    where: { switchAccountId },
    include: {
      leaguePlacements: { include: { squad: { include: { members: true } } } },
      placements: true,
    },
  });

  if (!player) return null;

  return {
    ...player,
    placements: player.placements.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;

      const modes = ["SZ", "TC", "RM", "CB"];
      return modes.indexOf(a.mode) - modes.indexOf(b.mode);
    }),
  };
};
