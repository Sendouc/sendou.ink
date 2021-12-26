import type { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type Create = Prisma.PromiseReturnType<typeof create>;
export function create({
  userId,
  teamName,
  tournamentId,
  friendCode,
}: {
  userId: string;
  teamName: string;
  tournamentId: string;
  friendCode: string;
}) {
  return db.tournamentTeam.create({
    data: {
      name: teamName.trim(),
      tournamentId,
      friendCode,
      members: {
        create: {
          memberId: userId,
          tournamentId,
          captain: true,
        },
      },
    },
  });
}

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.tournamentTeam.findUnique({
    where: { id },
    include: { tournament: { include: { organizer: true } }, members: true },
  });
}

export type CheckIn = Prisma.PromiseReturnType<typeof checkIn>;
export function checkIn(id: string) {
  return db.tournamentTeam.update({
    where: {
      id,
    },
    data: {
      checkedInTime: new Date(),
    },
  });
}

export type CheckOut = Prisma.PromiseReturnType<typeof checkOut>;
export function checkOut(id: string) {
  return db.tournamentTeam.update({
    where: {
      id,
    },
    data: {
      checkedInTime: null,
    },
  });
}
