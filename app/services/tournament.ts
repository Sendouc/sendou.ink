import type { Prisma, Stage, TeamOrder } from ".prisma/client";
import {
  TOURNAMENT_CHECK_IN_CLOSING_MINUTES_FROM_START,
  TOURNAMENT_TEAM_ROSTER_MAX_SIZE,
} from "~/constants";
import {
  EliminationBracket,
  EliminationBracketSide,
  losersRoundNames,
  MapListIds,
  tournamentRoundsForDB,
  winnersRoundNames,
} from "~/core/tournament/bracket";
import {
  canReportMatchScore,
  isTournamentAdmin,
} from "~/core/tournament/permissions";
import { matchIsOver, sortTeamsBySeed } from "~/core/tournament/utils";
import * as Tournament from "~/models/Tournament";
import * as TournamentBracket from "~/models/TournamentBracket";
import * as TournamentTeam from "~/models/TournamentTeam";
import * as TournamentTeamMember from "~/models/TournamentTeamMember";
import * as TrustRelationship from "~/models/TrustRelationship";
import * as TournamentMatch from "~/models/TournamentMatch";
import { Serialized, Unpacked } from "~/utils";
import { db } from "~/utils/db.server";
import invariant from "tiny-invariant";

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
  const result = await Tournament.findByNameForUrl({
    tournamentNameForUrl,
    organizationNameForUrl,
  });

  if (!result) throw new Response("No tournament found", { status: 404 });

  result.teams.sort(sortTeamsBySeed(result.seeds));

  result.organizer.twitter = twitterToUrl(result.organizer.twitter);
  result.organizer.discordInvite = discordInviteToUrl(
    result.organizer.discordInvite
  );
  const resultWithCSSProperties = addCSSProperties(result);

  return resultWithCSSProperties;
}

function twitterToUrl(twitter: string | null) {
  if (!twitter) return twitter;

  return `https://twitter.com/${twitter}`;
}

function discordInviteToUrl(discordInvite: string) {
  return `https://discord.com/invite/${discordInvite}`;
}

function addCSSProperties(
  tournament: Unpacked<NonNullable<Tournament.FindByNameForUrl>>
) {
  const { bannerTextHSLArgs, ...rest } = tournament;

  return {
    ...rest,
    CSSProperties: {
      text: `hsl(${bannerTextHSLArgs})`,
      textTransparent: `hsla(${bannerTextHSLArgs}, 0.3)`,
    },
  };
}

export type OwnTeamWithInviteCodeI = Serialized<
  Prisma.PromiseReturnType<typeof ownTeamWithInviteCode>
>;

export async function ownTeamWithInviteCode({
  organizationNameForUrl,
  tournamentNameForUrl,
  userId,
}: {
  organizationNameForUrl: string;
  tournamentNameForUrl: string;
  userId?: string;
}) {
  const tournaments = await Tournament.findByNameForUrlWithInviteCodes(
    tournamentNameForUrl
  );

  const tournament = tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );

  if (!tournament) throw new Response("No tournament found", { status: 404 });

  const ownTeam = tournament.teams.find((team) =>
    team.members.some(({ captain, member }) => captain && member.id === userId)
  );

  if (!ownTeam) throw new Response("No own team found", { status: 404 });

  return ownTeam;
}

export async function findTournamentWithInviteCodes({
  organizationNameForUrl,
  tournamentNameForUrl,
}: {
  organizationNameForUrl: string;
  tournamentNameForUrl: string;
}) {
  const tournaments = await Tournament.findByNameForUrlWithInviteCodes(
    tournamentNameForUrl
  );

  const result = tournaments.find(
    (tournament) =>
      tournament.organizer.nameForUrl === organizationNameForUrl.toLowerCase()
  );

  if (!result) throw new Response("No tournament found", { status: 404 });

  return result;
}

export type BracketModified = EliminationBracket<BracketModifiedSide>;
type BracketModifiedSide = {
  id: string;
  name: string;
  stages: { position: number; stage: Stage }[];
  matches: {
    id: string;
    number: number;
    score?: [upperTeamScore: number, lowerTeamScore: number];
    participants?: [upperTeamName: string | null, lowerTeamName: string | null];
    winnerDestinationMatchId: string | null;
    loserDestinationMatchId: string | null;
  }[];
}[];

export async function bracketById(bracketId: string): Promise<BracketModified> {
  const bracket = await TournamentBracket.findById(bracketId);

  if (!bracket) throw new Response("No bracket found", { status: 404 });

  const winnersRounds = bracket.rounds
    .filter((round) => round.position > 0)
    .sort((a, b) => a.position - b.position);

  const losersRounds = bracket.rounds
    .filter((round) => round.position < 0)
    .sort((a, b) => b.position - a.position);

  return {
    winners: modifyRounds(winnersRounds, "winners", losersRounds.length === 0),
    losers: modifyRounds(losersRounds, "losers", false),
  };
}

function modifyRounds(
  rounds: NonNullable<TournamentBracket.FindById>["rounds"],
  side: EliminationBracketSide,
  isSE: boolean
): BracketModifiedSide {
  const roundNames =
    side === "winners"
      ? winnersRoundNames(rounds.length, isSE)
      : losersRoundNames(rounds.length);
  return rounds.map((round, i) => {
    return {
      id: round.id,
      name: roundNames[i],
      stages: round.stages,
      matches: round.matches.map((match) => {
        const score =
          match.participants.length === 2
            ? match.results.reduce(
                (scores: [number, number], result) => {
                  if (result.winner === "UPPER") scores[0]++;
                  else scores[1]++;

                  return scores;
                },
                [0, 0]
              )
            : undefined;
        const participants: [string | null, string | null] | undefined =
          match.participants.length > 0
            ? [
                match.participants.find((p) => p.order === "UPPER")?.team
                  .name ?? null,
                match.participants.find((p) => p.order === "LOWER")?.team
                  .name ?? null,
              ]
            : undefined;
        return {
          number: match.position,
          id: match.id,
          winnerDestinationMatchId: match.winnerDestinationMatchId,
          loserDestinationMatchId: match.loserDestinationMatchId,
          score,
          participants,
        };
      }),
    };
  });
}

export const createTournamentTeam = TournamentTeam.create;

export async function createTournamentRounds({
  organizationNameForUrl,
  tournamentNameForUrl,
  mapList,
  userId,
  bracketId,
}: {
  organizationNameForUrl: string;
  tournamentNameForUrl: string;
  mapList: MapListIds;
  userId: string;
  bracketId: string;
}) {
  const tournament = await Tournament.findByNameForUrl({
    organizationNameForUrl,
    tournamentNameForUrl,
  });

  if (!tournament) throw new Response("No tournament found", { status: 404 });
  if (!isTournamentAdmin({ organization: tournament.organizer, userId })) {
    throw new Response("Not tournament admin", { status: 401 });
  }

  const bracket = tournament.brackets.find(
    (bracket) => bracket.id === bracketId
  );
  // TODO: OR rounds i.e. bracket was already started
  if (!bracket) {
    throw new Response("Invalid bracket id provided", { status: 400 });
  }

  const participantsSeeded = tournament.teams
    .filter((team) => team.checkedInTime)
    .sort(sortTeamsBySeed(tournament.seeds));

  const rounds = tournamentRoundsForDB({
    mapList,
    bracketType: bracket.type,
    participantsSeeded,
  });

  // TODO: use models
  return db.$transaction([
    db.tournamentRound.createMany({
      data: rounds.map((round) => ({
        bracketId: bracket.id,
        id: round.id,
        position: round.position,
      })),
    }),
    db.tournamentRoundStage.createMany({
      data: rounds.flatMap((round) => {
        return round.stages.map(({ position, stageId }) => ({
          position,
          stageId,
          roundId: round.id,
        }));
      }),
    }),
    db.tournamentMatch.createMany({
      data: rounds.flatMap((round) => {
        return round.matches.map((match) => ({
          id: match.id,
          position: match.number,
          roundId: round.id,
          winnerDestinationMatchId: match.winnerDestinationMatchId,
          loserDestinationMatchId: match.loserDestinationMatchId,
        }));
      }),
    }),
    db.tournamentMatchParticipant.createMany({
      data: rounds.flatMap((round) => {
        return round.matches.flatMap((match) => {
          return match.participants.flatMap((participant) => {
            if (participant.team === "BYE") return [];
            return {
              teamId: participant.team.id,
              matchId: match.id,
              order: participant.order,
            };
          });
        });
      }),
    }),
  ]);
}

export async function joinTeamViaInviteCode({
  tournamentId,
  inviteCode,
  userId,
}: {
  tournamentId: string;
  inviteCode: string;
  userId: string;
}) {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) throw new Response("Invalid tournament id", { status: 400 });

  // TODO: 400 if tournament already started / concluded (depending on if tournament allows mid-event roster additions)

  const tournamentTeamToJoin = tournament.teams.find(
    (team) => team.inviteCode === inviteCode
  );
  if (!tournamentTeamToJoin)
    throw new Response("Invalid invite code", { status: 400 });
  if (tournamentTeamToJoin.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE) {
    throw new Response("Team is already full", { status: 400 });
  }

  const trustReceiverId = tournamentTeamToJoin.members.find(
    ({ captain }) => captain
  )!.memberId;

  return Promise.all([
    TournamentTeamMember.create({
      teamId: tournamentTeamToJoin.id,
      userId,
      tournamentId,
    }),
    // TODO: this could also be put to queue and scheduled for later
    TrustRelationship.upsert({ trustReceiverId, trustGiverId: userId }),
  ]);
}

export async function putPlayerToTeam({
  teamId,
  captainId,
  newPlayerId,
}: {
  teamId: string;
  captainId: string;
  newPlayerId: string;
}) {
  const tournamentTeam = await TournamentTeam.findById(teamId);

  if (!tournamentTeam) throw new Response("Invalid team id", { status: 400 });

  // TODO: 400 if tournament already started / concluded (depending on if tournament allows mid-event roster additions)

  if (tournamentTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE) {
    throw new Response("Team is already full", { status: 400 });
  }

  if (
    !tournamentTeam.members.some(
      ({ memberId, captain }) => captain && memberId === captainId
    )
  ) {
    throw new Response("Not captain of the team", { status: 401 });
  }

  return TournamentTeamMember.create({
    tournamentId: tournamentTeam.tournament.id,
    teamId,
    userId: newPlayerId,
  });
}

export async function editTeam({
  teamId,
  userId,
  friendCode,
  roomPass,
  canHost,
}: {
  teamId: string;
  userId: string;
  friendCode: string;
  roomPass: string | null;
  canHost: boolean;
}) {
  const tournamentTeam = await TournamentTeam.findById(teamId);
  if (!tournamentTeam) throw new Response("Invalid team id", { status: 400 });

  if (
    !tournamentTeam.members.some(
      ({ memberId, captain }) => captain && memberId === userId
    )
  ) {
    throw new Response("Not captain of the team", { status: 401 });
  }

  return TournamentTeam.editTeam({
    id: teamId,
    canHost,
    friendCode,
    roomPass,
  });
}

export async function removePlayerFromTeam({
  teamId,
  userId,
  playerId,
}: {
  teamId: string;
  userId: string;
  playerId: string;
}) {
  if (userId === playerId) {
    throw new Response("Can't remove self", { status: 400 });
  }

  const tournamentTeam = await TournamentTeam.findById(teamId);

  if (!tournamentTeam) throw new Response("Invalid team id", { status: 400 });
  if (tournamentTeam.checkedInTime) {
    throw new Response("Can't remove players after checking in", {
      status: 400,
    });
  }
  if (
    !tournamentTeam.members.some(
      ({ memberId, captain }) => captain && memberId === userId
    )
  ) {
    throw new Response("Not captain of the team", { status: 401 });
  }

  return TournamentTeamMember.del({
    memberId: playerId,
    tournamentId: tournamentTeam.tournament.id,
  });
}

export async function checkIn({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) {
  const tournamentTeam = await TournamentTeam.findById(teamId);

  if (!tournamentTeam) throw new Response("Invalid team id", { status: 400 });

  if (
    !isTournamentAdmin({
      userId,
      organization: tournamentTeam.tournament.organizer,
    }) &&
    !tournamentTeam.members.some(
      ({ memberId, captain }) => captain && memberId === userId
    )
  ) {
    throw new Response("Not captain of the team", { status: 401 });
  }
  // cut them some slack so UI never shows you can check in when you can't
  const checkInCutOff = TOURNAMENT_CHECK_IN_CLOSING_MINUTES_FROM_START - 2;
  if (
    !isTournamentAdmin({
      userId,
      organization: tournamentTeam.tournament.organizer,
    }) &&
    tournamentTeam.tournament.startTime.getTime() - checkInCutOff * 60000 <
      new Date().getTime()
  ) {
    throw new Response("Check in time has passed", { status: 400 });
  }

  // TODO: fail if tournament has started

  return TournamentTeam.checkIn(teamId);
}

export async function checkOut({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) {
  const tournamentTeam = await TournamentTeam.findById(teamId);
  if (!tournamentTeam) throw new Response("Invalid team id", { status: 400 });
  if (
    !isTournamentAdmin({
      organization: tournamentTeam.tournament.organizer,
      userId,
    })
  ) {
    throw new Response("Not tournament admin", { status: 401 });
  }

  // TODO: fail if tournament has started

  return TournamentTeam.checkOut(teamId);
}

export async function updateSeeds({
  tournamentId,
  userId,
  newSeeds,
}: {
  tournamentId: string;
  userId: string;
  newSeeds: string[];
}) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Response("Invalid tournament id", { status: 400 });
  if (
    !isTournamentAdmin({
      organization: tournament.organizer,
      userId,
    })
  ) {
    throw new Response("Not tournament admin", { status: 401 });
  }

  // TODO: fail if tournament has started
  return Tournament.updateSeeds({ tournamentId, seeds: newSeeds });
}

export async function reportScore({
  userId,
  winnerTeamId,
  matchId,
  playerIds,
  position,
  bracketId,
}: {
  userId: string;
  winnerTeamId: string;
  matchId: string;
  playerIds: string[];
  position: number;
  bracketId: string;
}) {
  const match = await TournamentMatch.findById(matchId);
  if (!match) throw new Response("Invalid match id", { status: 400 });
  if (
    !canReportMatchScore({
      userId,
      members: match.participants.flatMap((p) => p.team.members),
    })
  ) {
    throw new Response("No permissions to report score", { status: 401 });
  }

  if (position <= match.results.length) {
    // no throw so it's handled gracefully if both teams report the score at the same time
    return;
  }
  if (
    matchIsOver(match.round.stages.length, matchResultsToTuple(match.results))
  ) {
    throw new Response("Match is already over", { status: 400 });
  }

  const winnerTeam = match.participants.find((p) => p.teamId === winnerTeamId);
  if (!winnerTeam) {
    throw new Response("Invalid winner team id", { status: 400 });
  }

  const stage = match.round.stages.find((stage) => stage.position === position);
  invariant(stage, "stage is undefined");

  // advance tournament after reporting score if match is over
  if (
    matchIsOver(
      match.round.stages.length,
      matchResultsToTuple(
        match.results
          .map((r) => ({ winner: r.winner }))
          .concat([{ winner: winnerTeam.order }])
      )
    )
  ) {
    const loserTeam = match.participants.find((p) => p.teamId !== winnerTeamId);
    invariant(loserTeam, "loserTeamId is undefined");

    const bracket = await TournamentBracket.findById(bracketId);
    if (!bracket) throw new Response("Invalid bracket id", { status: 400 });

    return db.$transaction([
      TournamentMatch.createResult({
        matchId,
        playerIds,
        roundStageId: stage.id,
        reporterId: userId,
        winner: winnerTeam.order,
      }),
      // todo: bracket reset
      TournamentMatch.createParticipants([
        match.winnerDestinationMatchId
          ? {
              matchId: match.winnerDestinationMatchId,
              order: resolveNewOrder({
                bracket,
                oldMatch: match,
                newMatchId: match.winnerDestinationMatchId,
              }),
              teamId: winnerTeam.teamId,
            }
          : undefined,
        match.loserDestinationMatchId
          ? {
              matchId: match.loserDestinationMatchId,
              order: resolveNewOrder({
                bracket,
                oldMatch: match,
                newMatchId: match.loserDestinationMatchId,
              }),
              teamId: loserTeam?.teamId,
            }
          : undefined,
      ]),
    ]);
    // otherwise if set is not over simply create result and return
  } else {
    return TournamentMatch.createResult({
      matchId,
      playerIds,
      roundStageId: stage.id,
      reporterId: userId,
      winner: winnerTeam.order,
    });
  }
}

function matchResultsToTuple(results: { winner: TeamOrder }[]) {
  return results.reduce(
    (acc: [number, number], result) => {
      if (result.winner === "UPPER") acc[0]++;
      else acc[1]++;
      return acc;
    },
    [0, 0]
  );
}

function resolveNewOrder({
  bracket,
  oldMatch,
  newMatchId,
}: {
  bracket: NonNullable<TournamentBracket.FindById>;
  oldMatch: NonNullable<TournamentMatch.FindById>;
  newMatchId: string;
}): TeamOrder {
  const allMatches = bracket.rounds.flat().flatMap((round) => {
    return round.matches;
  });

  const newMatch = allMatches.find((m) => m.id === newMatchId);
  invariant(newMatch, "newMatch is undefined");

  const matchesThatLeadToNewMatch = allMatches
    .filter((m) =>
      [m.loserDestinationMatchId, m.winnerDestinationMatchId].includes(
        newMatchId
      )
    )
    .sort((a, b) => a.position - b.position);
  invariant(
    matchesThatLeadToNewMatch.length === 2,
    `matchesThatLeadToNewMatch length was unexpected: ${matchesThatLeadToNewMatch.length}`
  );
  invariant(
    matchesThatLeadToNewMatch.find((m) => m.id === oldMatch.id),
    "oldMatch not among matchesThatLeadToNewMatch"
  );

  // if match number is smaller it should mean the match is above
  // the other match. thanks to sorting above 0 index should have
  // the smaller match number. Winner's bracket match should
  // always have the smaller number compared to loser's bracket match
  if (matchesThatLeadToNewMatch[0].id === oldMatch.id) return "UPPER";
  return "LOWER";
}
