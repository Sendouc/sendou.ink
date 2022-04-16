import type { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.tournament.findUnique({
    where: { id },
    include: {
      organizer: true,
      brackets: { include: { rounds: true } },
      teams: { include: { members: true } },
    },
  });
}

export type FindByNameForUrl = Prisma.PromiseReturnType<
  typeof findByNameForUrl
>;
export async function findByNameForUrl({
  tournamentNameForUrl,
  organizationNameForUrl,
  withInviteCodes = false,
}: {
  tournamentNameForUrl: string;
  organizationNameForUrl: string;
  withInviteCodes?: boolean;
}) {
  const tournaments = await db.tournament.findMany({
    where: {
      nameForUrl: tournamentNameForUrl.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      nameForUrl: true,
      description: true,
      startTime: true,
      checkInStartTime: true,
      bannerBackground: true,
      bannerTextHSLArgs: true,
      seeds: true,
      concluded: true,
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
          inviteCode: withInviteCodes,
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
                  friendCode: true,
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

export type OwnTeam = Prisma.PromiseReturnType<typeof ownTeam>;
export async function ownTeam({
  tournamentNameForUrl,
  organizerNameForUrl,
  user,
}: {
  tournamentNameForUrl: string;
  organizerNameForUrl: string;
  user: { id: string };
}) {
  const tournaments = await db.tournament.findMany({
    where: {
      organizer: {
        nameForUrl: organizerNameForUrl.toLowerCase(),
      },
      nameForUrl: tournamentNameForUrl.toLowerCase(),
    },
    include: {
      organizer: true,
      teams: {
        include: {
          members: {
            include: {
              member: true,
            },
          },
        },
      },
    },
  });

  if (tournaments.length === 0) return null;

  const ownTeam = tournaments[0].teams.find((team) =>
    team.members.some(({ captain, member }) => captain && member.id === user.id)
  );
  if (!ownTeam) null;

  return ownTeam;
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

export function conclude(id: string) {
  return db.tournament.update({
    where: { id },
    data: {
      concluded: true,
    },
  });
}
