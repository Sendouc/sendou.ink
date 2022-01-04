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
  roundStageId,
  reporterId,
  winner,
  matchId,
  playerIds,
}: {
  roundStageId: string;
  reporterId: string;
  winner: TeamOrder;
  matchId: string;
  playerIds: string[];
}) {
  return db.tournamentMatchGameResult.create({
    data: {
      roundStage: {
        connect: {
          id: roundStageId,
        },
      },
      reporterId,
      winner,
      players: {
        connect: playerIds.map((id) => ({ id })),
      },
      match: {
        connect: {
          id: matchId,
        },
      },
    },
  });
}
