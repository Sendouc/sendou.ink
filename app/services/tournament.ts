import { Prisma } from ".prisma/client";
import { json } from "remix";
import { Serialized } from "~/utils";
import { db } from "~/utils/db.server";

export type FindTournamentByNameForUrlI = Serialized<
  Prisma.PromiseReturnType<typeof findTournamentByNameForUrl>
>;

export async function findTournamentByNameForUrl({
  organizationNameForUrl,
  tournamentNameForUrl,
  userId,
}: {
  organizationNameForUrl: string;
  tournamentNameForUrl: string;
  userId?: string;
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
          inviteCode: true,
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

  let result = tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );

  if (!result) throw json("Not Found", { status: 404 });

  result = {
    ...result,
    teams: result.teams.map((team) => ({
      ...team,
      // Censor invite code if not captain of the team
      inviteCode: team.members
        .filter(({ captain }) => captain)
        .some(({ member }) => member.id === userId)
        ? team.inviteCode
        : "",
    })),
  };

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

function censorInviteCodeIfNotCaptain(
  inviteCode: string,
  members: { member: { id: number }; captain: boolean }[]
) {
  return inviteCode;
}

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
