import { Prisma } from ".prisma/client";
import prisma from "prisma/client";

const allRegisteredTeams = async () =>
  prisma.ladderRegisteredTeam.findMany({
    include: {
      roster: {
        select: {
          id: true,
          discordAvatar: true,
          discordId: true,
          discriminator: true,
          username: true,
          team: {
            select: {
              name: true,
              nameForUrl: true,
              twitterName: true,
            },
          },
        },
      },
    },
  });

const allLadderRegisteredTeamsForMatches = async () =>
  prisma.ladderRegisteredTeam.findMany({
    select: {
      id: true,
      roster: {
        select: {
          id: true,
          trueSkill: true,
        },
      },
    },
  });

export type NextLadderDay = Prisma.PromiseReturnType<typeof nextLadderDay>;

const nextLadderDay = async () => {
  return prisma.ladderDay.findFirst({
    where: { date: { gte: new Date() } },
    include: {
      matches: {
        select: {
          order: true,
          maplist: true,
          teamAScore: true,
          teamBScore: true,
          players: {
            select: {
              team: true,
              user: {
                select: {
                  id: true,
                  discordAvatar: true,
                  discordId: true,
                  discriminator: true,
                  username: true,
                  team: {
                    select: {
                      name: true,
                      nameForUrl: true,
                      twitterName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export type PreviousLadderDay = Prisma.PromiseReturnType<
  typeof previousLadderDay
>;

const previousLadderDay = async () => {
  return prisma.ladderDay.findFirst({
    where: { date: { lt: new Date() } },
    orderBy: { date: "desc" },
    select: {
      date: true,
      matches: {
        select: {
          order: true,
          maplist: true,
          teamAScore: true,
          teamBScore: true,
          players: {
            select: {
              team: true,
              user: {
                select: {
                  id: true,
                  discordAvatar: true,
                  discordId: true,
                  discriminator: true,
                  username: true,
                  team: {
                    select: {
                      name: true,
                      nameForUrl: true,
                      twitterName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

const playService = {
  allRegisteredTeams,
  allLadderRegisteredTeamsForMatches,
  nextLadderDay,
  previousLadderDay,
};

export default playService;
