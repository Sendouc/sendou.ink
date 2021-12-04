import { Prisma } from ".prisma/client";
import { json } from "remix";
import {
  TOURNAMENT_TEAM_ROSTER_MAX_SIZE,
  TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
} from "~/constants";
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

  if (userId) {
    result.teams.sort((teamA, teamB) => {
      // show team the user is member of first
      let aSortValue = Number(
        teamB.members.some(({ member }) => member.id === userId)
      );
      let bSortValue = Number(
        teamA.members.some(({ member }) => member.id === userId)
      );
      if (aSortValue !== bSortValue) return aSortValue - bSortValue;

      // TODO: show stronger teams first

      // otherwise let's show full teams first
      aSortValue = Number(
        teamB.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE
      );
      bSortValue = Number(
        teamA.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE
      );
      return aSortValue - bSortValue;
    });
  }

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

export async function findTournamentWithInviteCodes({
  organizationNameForUrl,
  tournamentNameForUrl,
}: {
  organizationNameForUrl: string;
  tournamentNameForUrl: string;
}) {
  const tournaments = await db.tournament.findMany({
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
      mapPool: {
        select: {
          mode: true,
          name: true,
        },
      },
      teams: {
        select: {
          name: true,
          inviteCode: true,
          members: {
            select: {
              captain: true,
              member: {
                select: {
                  discordName: true,
                  id: true,
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

  return result;
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

export async function joinTeam({
  tournamentId,
  inviteCode,
  userId,
}: {
  tournamentId: string;
  inviteCode: string;
  userId: string;
}) {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    include: { teams: { include: { members: true } } },
  });

  if (!tournament) throw json("Invalid tournament id", { status: 400 });

  const tournamentTeamToJoin = tournament.teams.find(
    (team) => team.inviteCode === inviteCode
  );
  if (!tournamentTeamToJoin) throw json("Invalid invite code", { status: 400 });
  if (tournamentTeamToJoin.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE) {
    throw json("Team is already full", { status: 400 });
  }

  return db.tournamentTeamMember.create({
    data: {
      tournamentId,
      teamId: tournamentTeamToJoin.id,
      memberId: userId,
    },
  });
}
