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
          stages: {
            select: {
              position: true,
              stage: true,
            },
          },
          matches: {
            select: {
              id: true,
              number: true,
              position: true,
              winnerDestinationMatchId: true,
              loserDestinationMatchId: true,
              participants: {
                select: {
                  team: {
                    select: {
                      id: true,
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
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });
}
