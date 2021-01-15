import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetTeamData = Prisma.PromiseReturnType<typeof getTeam>;

export const getTeam = async (
  where: { nameForUrl: string } | { id: number },
  inviteCode: boolean = false
) => {
  const team = await prisma.team.findUnique({
    where,
    select: {
      id: true,
      bio: true,
      recruitingPost: true,
      twitterName: true,
      name: true,
      captainId: true,
      nameForUrl: true,
      inviteCode: true,
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
          player: {
            select: {
              placements: {
                orderBy: {
                  xPower: "desc",
                },
                take: 1,
                select: {
                  weapon: true,
                  month: true,
                  year: true,
                  mode: true,
                  xPower: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return inviteCode ? team : { ...team, inviteCode: null };
};
