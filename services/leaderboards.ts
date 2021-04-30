import { LeagueType, Prisma, Region } from ".prisma/client";
import prisma from "prisma/client";
import { userBasicSelection } from "utils/prisma";

export type PeakByWeapon = Prisma.PromiseReturnType<typeof peakByWeapon>;

const peakByWeapon = (weapon: string) => {
  return prisma.xRankPlacement.findMany({
    distinct: ["switchAccountId"],
    orderBy: {
      xPower: "desc",
    },
    where: { weapon },
    select: {
      id: true,
      mode: true,
      month: true,
      playerName: true,
      switchAccountId: true,
      xPower: true,
      year: true,
      weapon: true,
      player: {
        select: {
          user: {
            select: userBasicSelection,
          },
        },
      },
    },
    take: 100,
  });
};

export type Peak = Prisma.PromiseReturnType<typeof peak>;

const peak = () => {
  return prisma.xRankPlacement.findMany({
    distinct: ["switchAccountId"],
    orderBy: {
      xPower: "desc",
    },
    select: {
      id: true,
      mode: true,
      month: true,
      playerName: true,
      switchAccountId: true,
      xPower: true,
      year: true,
      weapon: true,
      player: {
        select: {
          user: {
            select: userBasicSelection,
          },
        },
      },
    },
    take: 100,
  });
};

export type PeakLeague = Prisma.PromiseReturnType<typeof peakLeague>;

const peakLeague = ({ region, type }: { region: Region; type: LeagueType }) => {
  return prisma.leagueSquad.findMany({
    orderBy: {
      leaguePower: "desc",
    },
    select: {
      id: true,
      leaguePower: true,
      startTime: true,
      members: {
        select: {
          switchAccountId: true,
          weapon: true,
          player: {
            select: {
              name: true,
              user: {
                select: userBasicSelection,
              },
            },
          },
        },
      },
    },
    where: { region, type },
    take: 100,
  });
};

export default {
  peak,
  peakByWeapon,
  peakLeague,
};
