import prisma from "../prisma/client";

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
      name: true,
      description: true,
      startTime: true,
      checkInTime: true,
      bannerBackground: true,
      bannerTextColor: true,
      organizer: {
        select: {
          name: true,
          discordInvite: true,
          twitter: true,
          nameForUrl: true,
        },
      },
    },
  });

  const result = tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );

  if (!result) return result;

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
