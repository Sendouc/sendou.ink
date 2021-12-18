import type { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type Create = Prisma.PromiseReturnType<typeof create>;
export function create({
  userId,
  teamId,
  tournamentId,
}: {
  userId: string;
  teamId: string;
  tournamentId: string;
}) {
  return db.tournamentTeamMember.create({
    data: {
      tournamentId,
      teamId,
      memberId: userId,
    },
  });
}

export type Del = Prisma.PromiseReturnType<typeof del>;
export function del({
  memberId,
  tournamentId,
}: {
  memberId: string;
  tournamentId: string;
}) {
  return db.tournamentTeamMember.delete({
    where: {
      memberId_tournamentId: {
        memberId,
        tournamentId,
      },
    },
  });
}
