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

export function findById(userId?: string) {
  if (!userId) return;
  return db.user.findUnique({ where: { id: userId } });
}

export function update({
  userId,
  miniBio,
  weapons,
}: {
  userId: string;
  miniBio: Nullable<string>;
  weapons: string[];
}) {
  return db.user.update({ where: { id: userId }, data: { miniBio, weapons } });
}
