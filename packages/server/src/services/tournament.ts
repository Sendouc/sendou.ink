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
    include: {
      organizer: true,
    },
  });

  return tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );
}
