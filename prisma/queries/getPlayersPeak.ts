import { Prisma, RankedMode } from "@prisma/client";
import prisma from "prisma/client";

export type GetPlayersPeakData = Prisma.PromiseReturnType<
  typeof getPlayersPeak
>;

export const getPlayersPeak = async (switchAccountId: string) => {
  const player = await prisma.player.findUnique({
    where: { switchAccountId },
    select: {
      placements: {
        select: {
          xPower: true,
          mode: true,
        },
      },
      leaguePlacements: {
        select: { squad: { select: { leaguePower: true, type: true } } },
      },
    },
  });

  if (!player) return { peakXPowers: {}, peakLeaguePowers: {} };

  const peakXPowers: Partial<Record<RankedMode, number>> = {};

  for (const placement of player.placements) {
    peakXPowers[placement.mode] = Math.max(
      peakXPowers[placement.mode] ?? 0,
      placement.xPower
    );
  }

  const peakLeaguePowers = player.leaguePlacements.reduce(
    (acc: { TWIN?: number; QUAD?: number }, cur) => {
      acc[cur.squad.type] = Math.max(
        acc[cur.squad.type] ?? 0,
        cur.squad.leaguePower
      );
      return acc;
    },
    { TWIN: undefined, QUAD: undefined }
  );

  return { peakXPowers, peakLeaguePowers };
};
