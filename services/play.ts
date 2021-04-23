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

const nextLadderDay = async () => {
  const d = new Date();
  d.setHours(d.getHours() - 6);

  return prisma.ladderDay.findFirst({
    where: { date: { gte: d } },
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

export default {
  allRegisteredTeams,
  allLadderRegisteredTeamsForMatches,
  nextLadderDay,
};
