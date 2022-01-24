import { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type FindManyByTrustReceiverId = Prisma.PromiseReturnType<
  typeof findManyByTrustReceiverId
>;
export function findManyByTrustReceiverId(userId: string) {
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

export type Upsert = Prisma.PromiseReturnType<typeof upsert>;
export function upsert({
  trustGiverId,
  trustReceiverId,
}: {
  trustGiverId: string;
  trustReceiverId: string;
}) {
  return db.trustRelationships.upsert({
    where: {
      trustGiverId_trustReceiverId: {
        trustGiverId,
        trustReceiverId,
      },
    },
    create: {
      trustGiverId,
      trustReceiverId,
    },
    update: {},
  });
}
