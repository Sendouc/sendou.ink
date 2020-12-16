import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllSalmonRunRotationsData = Prisma.PromiseReturnType<
  typeof getAllSalmonRunRotations
>;

export const getAllSalmonRunRotations = async () =>
  prisma.salmonRunRotation.findMany({
    where: { startTime: { lt: new Date() } },
    orderBy: { id: "desc" },
    select: { id: true, startTime: true, weapons: true, stage: true },
  });
