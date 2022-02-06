import { db } from "~/utils/db.server";

export function findById(id: string) {
  return db.lfgGroupMatch.findUnique({
    where: { id },
    select: {
      stages: {
        select: {
          stage: {
            select: {
              name: true,
              mode: true,
            },
          },
        },
      },
      groups: { include: { members: { include: { user: true } } } },
    },
  });
}
