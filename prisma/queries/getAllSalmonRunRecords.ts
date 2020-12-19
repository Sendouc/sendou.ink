import { Prisma } from "@prisma/client";
import prisma from "prisma/client";

export type GetAllSalmonRunRecordsData = Prisma.PromiseReturnType<
  typeof getAllSalmonRunRecords
>;

export const getAllSalmonRunRecords = async (
  userId?: number,
  fetchUnapproved?: boolean
) =>
  fetchUnapproved
    ? prisma.salmonRunRecord.findMany({
        where: { approved: false },
        include: {
          rotation: true,
          roster: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : prisma.salmonRunRecord.findMany({
        where: { OR: [{ approved: true }, { submitterId: userId ?? -1 }] },
        include: {
          rotation: true,
          roster: true,
        },
      });
