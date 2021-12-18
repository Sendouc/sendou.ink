import { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

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
