import { Prisma, TeamOrder } from "@prisma/client";
import { db } from "~/utils/db.server";
import type {
  Mode,
  TournamentMatchGameResult,
  TournamentTeamMember,
  User,
} from "@prisma/client";
import invariant from "tiny-invariant";
import { TeamRosterInputTeam } from "~/components/tournament/TeamRosterInputs";
import { getRoundNameByPositions } from "~/core/tournament/bracket";
import { v4 as uuidv4 } from "uuid";
import { MatchIsOverArgs } from "~/core/tournament/utils";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.tournamentMatch.findUnique({
    where: { id },
    include: {
      round: {
        include: {
          stages: true,
        },
      },
      results: true,
      participants: {
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      },
    },
  });
}

export function createResult({
  roundStageId,
  reporterId,
  winner,
  matchId,
  playerIds,
}: {
  roundStageId: string;
  reporterId: string;
  winner: TeamOrder;
  matchId: string;
  playerIds: string[];
}) {
  return db.tournamentMatchGameResult.create({
    data: {
      roundStage: {
        connect: {
          id: roundStageId,
        },
      },
      reporterId,
      winner,
      players: {
        connect: playerIds.map((id) => ({ id })),
      },
      match: {
        connect: {
          id: matchId,
        },
      },
    },
  });
}

export function deleteResult(id: string) {
  return db.tournamentMatchGameResult.delete({ where: { id } });
}

export function updateResults({
  matchId,
  newResults,
  reporterId,
}: {
  matchId: string;
  newResults: {
    UNSAFE_playerIds: string[];
    roundStageId: string;
    winnerOrder: TeamOrder;
  }[];
  reporterId: string;
}) {
  const newResultsWithIds = newResults.map((r) => ({ ...r, id: uuidv4() }));

  return db.$transaction([
    db.tournamentMatchGameResult.deleteMany({
      where: {
        matchId,
      },
    }),
    db.tournamentMatchGameResult.createMany({
      data: newResultsWithIds.map((result) => ({
        id: result.id,
        matchId,
        reporterId,
        roundStageId: result.roundStageId,
        winner: result.winnerOrder,
      })),
    }),
    db.$executeRawUnsafe(`
      insert into "_TournamentMatchGameResultToUser" ("A", "B") values
        ${newResultsWithIds
          .flatMap((result) =>
            result.UNSAFE_playerIds.map(
              (playerId) => `('${result.id}', '${playerId}')`
            )
          )
          .join(", ")};
    `),
  ]);
}

export type CreateParticipantsData = {
  matchId: string;
  order: TeamOrder;
  teamId: string;
}[];
export function createParticipants(data: CreateParticipantsData) {
  return db.tournamentMatchParticipant.createMany({
    data,
  });
}

export type FindInfoForModal =
  | {
      id: string;
      title: string;
      scoreTitle: string;
      roundName: string;
      bestOf: MatchIsOverArgs["bestOf"];
      score: MatchIsOverArgs["score"];
      matchInfos: {
        idForFrontend: string;
        teamUpper: TeamRosterInputTeam;
        teamLower: TeamRosterInputTeam;
        winnerId?: string;
        stage: { name: string; mode: Mode };
      }[];
    }
  | undefined;
export async function findInfoForModal({
  bracketId,
  matchNumber,
}: {
  bracketId: string;
  matchNumber: number;
}): Promise<FindInfoForModal> {
  const tournamentRounds = await db.tournamentRound.findMany({
    where: { bracketId },
    include: {
      matches: {
        include: {
          results: { include: { players: true } },
          participants: {
            include: {
              team: { include: { members: { include: { member: true } } } },
            },
          },
        },
      },
      stages: { include: { stage: true } },
    },
  });

  const tournamentRound = tournamentRounds.find((round) =>
    round.matches.find((match) => match.number === matchNumber)
  );
  const match = tournamentRound?.matches.find(
    (match) => match.number === matchNumber
  );

  if (!tournamentRound || !match) return;

  const teamsOrdered = match.participants.sort((a, b) =>
    b.order.localeCompare(a.order)
  );

  const upperTeam = match.participants.find((p) => p.order === "UPPER");
  const lowerTeam = match.participants.find((p) => p.order === "LOWER");
  invariant(upperTeam && lowerTeam, "upper or lower team is undefined");

  const matchInfos = tournamentRound.stages
    .sort((a, b) => a.position - b.position)
    .map((tournamentRoundStage) => {
      /** Result of this one stage, if undefined means the stage was not played yet */
      const stageResult = match.results.find(
        (r) => r.roundStageId === tournamentRoundStage.id
      );

      const membersWithPlayedInfo = playersOfMatch({
        stageResult,
        upperTeamMembers: upperTeam.team.members,
        lowerTeamMembers: lowerTeam.team.members,
      });

      return {
        idForFrontend: uuidv4(),
        teamUpper: {
          name: upperTeam.team.name,
          id: upperTeam.teamId,
          members: membersWithPlayedInfo.upperTeamMembers,
        },
        teamLower: {
          name: lowerTeam.team.name,
          id: lowerTeam.teamId,
          members: membersWithPlayedInfo.lowerTeamMembers,
        },
        winnerId: stageResult
          ? stageResult.winner === "UPPER"
            ? upperTeam.teamId
            : lowerTeam.teamId
          : undefined,
        stage: {
          name: tournamentRoundStage.stage.name,
          mode: tournamentRoundStage.stage.mode,
        },
      };
    });

  const score = match.results.reduce(
    (scores: [number, number], result) => {
      if (result.winner === "UPPER") scores[0]++;
      else scores[1]++;
      return scores;
    },
    [0, 0]
  );
  const scoreTitle = score.join("-");

  return {
    id: match.id,
    title: `${teamsOrdered[0].team.name} vs. ${teamsOrdered[1].team.name}`,
    scoreTitle,
    roundName: getRoundNameByPositions(
      tournamentRound.position,
      tournamentRounds.map((round) => round.position)
    ),
    matchInfos,
    score,
    bestOf: tournamentRound.stages.length,
  };
}

/** Returns players grouped by team with info whether they played this stage or not */
function playersOfMatch({
  stageResult,
  upperTeamMembers,
  lowerTeamMembers,
}: {
  stageResult?: TournamentMatchGameResult & {
    players: User[];
  };
  upperTeamMembers: (TournamentTeamMember & {
    member: User;
  })[];
  lowerTeamMembers: (TournamentTeamMember & {
    member: User;
  })[];
}) {
  if (!stageResult) return { upperTeamMembers, lowerTeamMembers };

  const stageResultPlayerIds = stageResult.players.reduce(
    (acc, cur) => acc.add(cur.id),
    new Set<string>()
  );

  return {
    upperTeamMembers: upperTeamMembers.map(({ member }) => {
      return {
        member: {
          id: member.id,
          discordName: member.discordName,
          played: stageResultPlayerIds.has(member.id),
        },
      };
    }),
    lowerTeamMembers: lowerTeamMembers.map(({ member }) => {
      return {
        member: {
          id: member.id,
          discordName: member.discordName,
          played: stageResultPlayerIds.has(member.id),
        },
      };
    }),
  };
}

export type AllTournamentMatchesWithRosterInfo = Prisma.PromiseReturnType<
  typeof allTournamentMatchesWithRosterInfo
>;
export function allTournamentMatchesWithRosterInfo(bracketId: string) {
  return db.tournamentMatch.findMany({
    select: {
      participants: {
        select: {
          team: {
            select: {
              members: {
                select: {
                  memberId: true,
                },
              },
            },
          },
          order: true,
        },
      },
      results: {
        select: {
          players: {
            select: {
              id: true,
            },
          },
          winner: true,
        },
      },
    },
    where: { round: { bracketId } },
    orderBy: { position: "asc" },
  });
}
