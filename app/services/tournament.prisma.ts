import { Prisma } from ".prisma/client";
import { db } from "~/utils/db.server";

export type PrismaTournamentsByNameForUrl = Prisma.PromiseReturnType<
  typeof tournamentsByNameForUrl
>;

export function tournamentsByNameForUrl(tournamentNameForUrl: string) {
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
          mode: true,
          name: true,
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
