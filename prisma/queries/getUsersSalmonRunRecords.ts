import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetUsersSalmonRunRecordsData = Prisma.PromiseReturnType<
  typeof getUsersSalmonRunRecords
>;

export const getUsersSalmonRunRecords = async (id: number) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      discordId: true,
      discordAvatar: true,
      username: true,
      discriminator: true,
      salmonRunRecords: {
        select: {
          id: true,
          category: true,
          goldenEggCount: true,
          links: true,
          approved: true,
          rotation: {
            select: {
              grizzcoWeapon: true,
              stage: true,
              startTime: true,
              endTime: true,
              weapons: true,
            },
          },
          roster: {
            select: {
              discordId: true,
              discordAvatar: true,
              username: true,
              discriminator: true,
            },
          },
        },
      },
    },
  });
