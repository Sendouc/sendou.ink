import { db } from "~/utils/db.server";

export function findById(id: string) {
  return db.lfgGroupMatch.findUnique({
    where: { id },
    select: { groups: { include: { members: { include: { user: true } } } } },
  });
}
