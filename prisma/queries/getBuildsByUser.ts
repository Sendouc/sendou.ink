import { Prisma } from "@prisma/client";
import DBClient from "prisma/client";

export type GetBuildsByUserData = Prisma.PromiseReturnType<typeof getBuildsByUser>;

const prisma = DBClient.getInstance().prisma;

export const getBuildsByUser = async (userId: number) =>
  prisma.build.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
  });
