import { Prisma, TeamOrder } from "@prisma/client";
import { db } from "~/utils/db.server";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.tournamentMatch.findUnique({
    where: { id },
    include: {
      round: {
        include: {
          stages: true,
        },
      },
      results: true,
      participants: {
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      },
    },
  });
}

export function createResult({
  position,
  reporterId,
  winner,
  matchId,
}: {
  position: number;
  reporterId: string;
  winner: TeamOrder;
  matchId: string;
}) {
  return db.tournamentMatchGameResult.create({
    data: {
      position,
      reporterId,
      winner,
      match: {
        connect: {
          id: matchId,
        },
      },
    },
  });
}
