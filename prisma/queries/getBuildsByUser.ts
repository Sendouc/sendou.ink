import { Prisma, PrismaClient } from "@prisma/client";

export type GetBuildsByUserData = Prisma.PromiseReturnType<
  typeof getBuildsByUser
>;

const prisma = new PrismaClient();

export const getBuildsByUser = async (userId: number) =>
  prisma.build.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
  });
