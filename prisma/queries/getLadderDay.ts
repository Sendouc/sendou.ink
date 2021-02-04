import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetLadderDayData = Prisma.PromiseReturnType<typeof getLadderDay>;

export const getLadderDay = async () => {
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
