import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllUsersData = Prisma.PromiseReturnType<typeof getAllUsers>;

export const getAllUsers = async () =>
  prisma.user.findMany({
    select: {
      discordId: true,
      username: true,
      discriminator: true,
      discordAvatar: true,
      profile: {
        select: {
          country: true,
          twitterName: true,
        },
      },
    },
  });
