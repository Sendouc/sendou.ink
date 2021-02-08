import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllPlayersByPIDData = Prisma.PromiseReturnType<
  typeof getAllPlayersByPID
>;

export const getAllPlayersByPID = async (principalId: string) =>
  prisma.player.findMany({
    where: { principalId },
    select: { switchAccountId: true },
  });
