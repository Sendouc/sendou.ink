import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export type FindAllMostRecent = Prisma.PromiseReturnType<
  typeof findAllMostRecent
>;
export function findAllMostRecent() {
  return db.skill.findMany({
    orderBy: {
      createdAt: "desc",
    },
    distinct: "userId",
  });
}

export function findAll() {
  return db.skill.findMany({ include: { match: true, user: true } });
}
