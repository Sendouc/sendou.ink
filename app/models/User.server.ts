import type { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export type FindTrusters = Prisma.PromiseReturnType<typeof findTrusters>;
export function findTrusters(userId: string) {
  return db.trustRelationships.findMany({
    where: { trustReceiverId: userId },
    select: {
      trustGiver: {
        select: {
          id: true,
          discordName: true,
        },
      },
    },
  });
}
