import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetTeamData = Prisma.PromiseReturnType<typeof getTeam>;

export const getTeam = async (nameForUrl: string) =>
  prisma.team.findUnique({
    where: { nameForUrl },
    select: {
      bio: true,
      recruitingPost: true,
      twitterName: true,
      name: true,
      captainId: true,
      roster: {
        select: {
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
