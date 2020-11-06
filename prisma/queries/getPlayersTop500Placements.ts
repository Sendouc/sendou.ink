import { PrismaClient } from "@prisma/client";
import { Unwrap } from "lib/types";

export type GetPlayersTop500Placements = Unwrap<
  ReturnType<typeof getPlayersTop500Placements>
>;

export const getPlayersTop500Placements = async ({
  prisma,
  switchAccountId,
}: {
  prisma: PrismaClient;
  switchAccountId: string;
}) => {
  return prisma.xRankPlacement.findMany({
    where: { switchAccountId },
    orderBy: [{ month: "desc" }, { year: "desc" }],
  });
};
