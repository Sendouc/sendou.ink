import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export type FindAllMostRecent = Prisma.PromiseReturnType<
  typeof findAllMostRecent
>;
export function findAllMostRecent() {
  return db.skill.findMany({
    // TODO: tournament match, skill decay... createdAt
    orderBy: {
      match: {
        createdAt: "desc",
      },
    },
    distinct: "userId",
  });
}

export function findMostRecentByUserIds(ids: string[]) {
  return db.skill.findMany({
    orderBy: {
      // TODO: tournament match, skill decay... createdAt
      match: {
        createdAt: "desc",
      },
    },
    distinct: "userId",
    where: { userId: { in: ids } },
  });
}

export function findAllByMonth({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const from = new Date(year, month - 1, 1);
  // https://stackoverflow.com/questions/222309/calculate-last-day-of-month
  const to = new Date(Date.UTC(year, month, 0));

  return db.skill.findMany({
    include: { match: { select: { createdAt: true } }, user: true },
    where: {
      match: { AND: [{ createdAt: { gte: from } }, { createdAt: { lt: to } }] },
    },
  });
}
