import { Prisma, Skill } from "@prisma/client";
import { db } from "~/utils/db.server";

export function createMany(
  data: Pick<
    Skill,
    "mu" | "sigma" | "tournamentId" | "userId" | "amountOfSets"
  >[]
) {
  return db.skill.createMany({
    data,
  });
}

export type FindAllMostRecent = Prisma.PromiseReturnType<
  typeof findAllMostRecent
>;
export function findAllMostRecent(userIds?: string[]) {
  return db.skill.findMany({
    orderBy: {
      createdAt: "desc",
    },
    distinct: "userId",
    where: userIds
      ? {
          userId: {
            in: userIds,
          },
        }
      : undefined,
  });
}

export function findMostRecentByUserIds(ids: string[]) {
  return db.skill.findMany({
    orderBy: {
      createdAt: "desc",
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
    include: { user: true },
    where: {
      AND: [{ createdAt: { gte: from } }, { createdAt: { lt: to } }],
    },
  });
}
