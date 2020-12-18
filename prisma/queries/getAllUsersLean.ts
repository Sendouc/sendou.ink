import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllUsersLeanData = Prisma.PromiseReturnType<
  typeof getAllUsersLean
>;

export const getAllUsersLean = async () =>
  prisma.user.findMany({
    select: {
      id: true,
      username: true,
      discriminator: true,
      discordAvatar: true,
      discordId: true,
    },
  });
