import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllLadderRegisteredTeamsData = Prisma.PromiseReturnType<
  typeof getAllLadderRegisteredTeams
>;

export const getAllLadderRegisteredTeams = async () =>
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
