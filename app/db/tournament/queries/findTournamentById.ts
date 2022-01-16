import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export type FindTournamentById = Prisma.PromiseReturnType<
  typeof findTournamentById
>;

export function findTournamentById(id: string) {
  return db.tournament.findUnique({
    where: { id },
    include: {
      organizer: true,
      brackets: { include: { rounds: true } },
      teams: { include: { members: true } },
    },
  });
}
