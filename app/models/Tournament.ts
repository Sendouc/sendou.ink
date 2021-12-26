import type { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.tournament.findUnique({
    where: { id },
    include: { organizer: true, teams: { include: { members: true } } },
  });
}

export type FindByNameForUrl = Prisma.PromiseReturnType<
  typeof findByNameForUrl
>;
export async function findByNameForUrl({
  tournamentNameForUrl,
  organizationNameForUrl,
}: {
  tournamentNameForUrl: string;
  organizationNameForUrl: string;
}) {
  const tournaments = await db.tournament.findMany({
    where: {
      nameForUrl: tournamentNameForUrl.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      description: true,
      startTime: true,
      checkInStartTime: true,
      bannerBackground: true,
      bannerTextHSLArgs: true,
      seeds: true,
      organizer: {
        select: {
          name: true,
          discordInvite: true,
          twitter: true,
          nameForUrl: true,
          ownerId: true,
        },
      },
      mapPool: {
        select: {
          id: true,
          mode: true,
          name: true,
        },
      },
      brackets: {
        select: {
          id: true,
          type: true,
          rounds: {
            select: {
              position: true,
            },
          },
        },
      },
      teams: {
        select: {
          checkedInTime: true,
          id: true,
          name: true,
          createdAt: true,
          members: {
            select: {
              captain: true,
              member: {
                select: {
                  id: true,
                  discordAvatar: true,
                  discordName: true,
                  discordId: true,
                  discordDiscriminator: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );
}

export type FindByNameForUrlWithInviteCodes = Prisma.PromiseReturnType<
  typeof findByNameForUrlWithInviteCodes
>;

// TODO: merge with above and don't repeat .find() logic
export function findByNameForUrlWithInviteCodes(tournamentNameForUrl: string) {
  return db.tournament.findMany({
    where: {
      nameForUrl: tournamentNameForUrl.toLowerCase(),
    },
    select: {
      startTime: true,
      organizer: {
        select: {
          nameForUrl: true,
        },
      },
      teams: {
        select: {
          id: true,
          name: true,
          inviteCode: true,
          checkedInTime: true,
          friendCode: true,
          roomPass: true,
          canHost: true,
          members: {
            select: {
              captain: true,
              member: {
                select: {
                  id: true,
                  discordAvatar: true,
                  discordName: true,
                  discordId: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export type UpdateSeeds = Prisma.PromiseReturnType<typeof updateSeeds>;
export function updateSeeds({
  tournamentId,
  seeds,
}: {
  tournamentId: string;
  seeds: string[];
}) {
  return db.tournament.update({
    where: {
      id: tournamentId,
    },
    data: {
      seeds,
    },
  });
}
