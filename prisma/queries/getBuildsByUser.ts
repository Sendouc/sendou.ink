import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetBuildsByUserData = Prisma.PromiseReturnType<
  typeof getBuildsByUser
>;

export const getBuildsByUser = async (userId: number) =>
  prisma.build.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
  });
