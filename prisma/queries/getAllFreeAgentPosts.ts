import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllFreeAgentPostsData = Prisma.PromiseReturnType<
  typeof getAllFreeAgentPosts
>;

export const getAllFreeAgentPosts = async () =>
  prisma.freeAgentPost.findMany({
    select: {
      id: true,
      canVC: true,
      playstyles: true,
      content: true,
      updatedAt: true,
      user: {
        select: {
          username: true,
          discordId: true,
          discriminator: true,
          discordAvatar: true,
          profile: {
            select: {
              weaponPool: true,
              country: true,
              bio: true,
            },
          },
        },
      },
    },
  });
