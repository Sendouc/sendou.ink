import { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(bracketId: string) {
  return db.tournamentBracket.findUnique({
    where: { id: bracketId },
    select: {
      rounds: {
        select: {
          id: true,
          position: true,
          _count: {
            select: {
              stages: true,
            },
          },
          matches: {
            select: {
              id: true,
              participants: {
                select: {
                  team: {
                    select: {
                      name: true,
                    },
                  },
                  order: true,
                },
              },
              results: {
                select: {
                  winner: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
