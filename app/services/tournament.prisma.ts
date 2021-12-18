import { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type PrismaTournaments = Prisma.PromiseReturnType<typeof tournaments>;

export function tournaments(tournamentNameForUrl: string) {
  return db.tournament.findMany({
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
          type: true,
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
}

export type PrismaTournamentsWithInviteCodes = Prisma.PromiseReturnType<
  typeof tournamentsWithInviteCodes
>;

export function tournamentsWithInviteCodes(tournamentNameForUrl: string) {
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

export type PrismaTournamentById = Prisma.PromiseReturnType<
  typeof tournamentById
>;

export function tournamentById(id: string) {
  return db.tournament.findUnique({
    where: { id },
    include: { organizer: true, teams: { include: { members: true } } },
  });
}

export type PrismaTournamentTeamById = Prisma.PromiseReturnType<
  typeof tournamentTeamById
>;

export function tournamentTeamById(id: string) {
  return db.tournamentTeam.findUnique({
    where: { id },
    include: { tournament: { include: { organizer: true } }, members: true },
  });
}

export type PrismaCreateTournamentTeam = Prisma.PromiseReturnType<
  typeof createTournamentTeam
>;

export function createTournamentTeam({
  userId,
  teamName,
  tournamentId,
}: {
  userId: string;
  teamName: string;
  tournamentId: string;
}) {
  return db.tournamentTeam.create({
    data: {
      name: teamName.trim(),
      tournamentId,
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

export type PrismaCreateTournamentTeamMember = Prisma.PromiseReturnType<
  typeof createTournamentTeamMember
>;

export function createTournamentTeamMember({
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

export type PrismaDeleteTournamentTeamMember = Prisma.PromiseReturnType<
  typeof deleteTournamentTeamMember
>;

export function deleteTournamentTeamMember({
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

export type PrismaUpdateTournamentSeeds = Prisma.PromiseReturnType<
  typeof updateTournamentSeeds
>;

export function updateTournamentSeeds({
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

export type PrismaUpdateTeamCheckIn = Prisma.PromiseReturnType<
  typeof updateTeamCheckIn
>;

export function updateTeamCheckIn(id: string) {
  return db.tournamentTeam.update({
    where: {
      id,
    },
    data: {
      checkedInTime: new Date(),
    },
  });
}

export type PrismaUpdateTeamCheckOut = Prisma.PromiseReturnType<
  typeof updateTeamCheckOut
>;

export function updateTeamCheckOut(id: string) {
  return db.tournamentTeam.update({
    where: {
      id,
    },
    data: {
      checkedInTime: null,
    },
  });
}

export type PrismaUpsertTrustRelationship = Prisma.PromiseReturnType<
  typeof upsertTrustRelationship
>;

export function upsertTrustRelationship({
  trustGiverId,
  trustReceiverId,
}: {
  trustGiverId: string;
  trustReceiverId: string;
}) {
  return db.trustRelationships.upsert({
    where: {
      trustGiverId_trustReceiverId: {
        trustGiverId,
        trustReceiverId,
      },
    },
    create: {
      trustGiverId,
      trustReceiverId,
    },
    update: {},
  });
}
