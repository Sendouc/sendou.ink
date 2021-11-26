import { Prisma } from ".prisma/client";
import { json } from "remix";
import { Serialized } from "~/utils";
import prisma from "../prisma/client";

export type FindTournamentByNameForUrlI = Serialized<
  Prisma.PromiseReturnType<typeof findTournamentByNameForUrl>
>;

export async function findTournamentByNameForUrl({
  organizationNameForUrl,
  tournamentNameForUrl,
}: {
  organizationNameForUrl: string;
  tournamentNameForUrl: string;
}) {
  const tournaments = await prisma.tournament.findMany({
    where: {
      nameForUrl: tournamentNameForUrl.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      description: true,
      startTime: true,
      checkInTime: true,
      bannerBackground: true,
      bannerTextHSLArgs: true,
      organizer: {
        select: {
          name: true,
          discordInvite: true,
          twitter: true,
          nameForUrl: true,
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
          checkedIn: true,
          id: true,
          name: true,
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

  const result = tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );

  if (!result) throw json("Not Found", { status: 404 });

  result.organizer.twitter = twitterToUrl(result.organizer.twitter);
  result.organizer.discordInvite = discordInviteToUrl(
    result.organizer.discordInvite
  );

  return result;
}

function twitterToUrl(twitter: string | null) {
  if (!twitter) return twitter;

  return `https://twitter.com/${twitter}`;
}

function discordInviteToUrl(discordInvite: string) {
  return `https://discord.com/invite/${discordInvite}`;
}

export function createTournamentTeam({
  userId,
  name,
  tournamentId,
}: {
  userId: number;
  name: string;
  tournamentId: number;
}) {
  return prisma.tournamentTeam.create({
    data: {
      name: name.trim(),
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
