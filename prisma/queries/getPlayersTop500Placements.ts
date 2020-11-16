import { PromiseReturnType } from "@prisma/client";
import DBClient from "prisma/client";

const prisma = DBClient.getInstance().prisma;

export type GetPlayersTop500Placements = PromiseReturnType<
  typeof getPlayersTop500Placements
>;

export const getPlayersTop500Placements = async (switchAccountId: string) => {
  return prisma.xRankPlacement.findMany({
    where: { switchAccountId },
    orderBy: [{ month: "desc" }, { year: "desc" }],
  });
};
