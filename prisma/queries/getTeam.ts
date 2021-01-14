import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetTeamData = Prisma.PromiseReturnType<typeof getTeam>;

export const getTeam = async (where: { nameForUrl: string } | { id: number }) =>
  prisma.team.findUnique({
    where,
    select: {
      id: true,
      bio: true,
      recruitingPost: true,
      twitterName: true,
      name: true,
      captainId: true,
      roster: {
        select: {
          id: true,
          discordId: true,
          discordAvatar: true,
          username: true,
          discriminator: true,
          profile: {
            select: {
              weaponPool: true,
              country: true,
            },
          },
        },
      },
    },
  });
