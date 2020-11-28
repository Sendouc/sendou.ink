import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetPlayersTop500Placements = Prisma.PromiseReturnType<
  typeof getPlayersTop500Placements
>;

export const getPlayersTop500Placements = async (switchAccountId: string) => {
  return prisma.xRankPlacement.findMany({
    where: { switchAccountId },
    orderBy: [{ year: "desc" }, { month: "desc" }, { ranking: "asc" }],
  });
};
