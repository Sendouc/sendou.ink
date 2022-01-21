import type { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type JoinTeam = Prisma.PromiseReturnType<typeof joinTeam>;
export function joinTeam({
  memberId,
  teamId,
  tournamentId,
}: {
  memberId: string;
  teamId: string;
  tournamentId: string;
}) {
  return db.tournamentTeamMember.create({
    data: {
      tournamentId,
      teamId,
      memberId,
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
