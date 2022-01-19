import type {
  Mode,
  TournamentMatchGameResult,
  TournamentTeamMember,
  User,
} from "@prisma/client";
import invariant from "tiny-invariant";
import { TeamRosterInputTeam } from "~/components/tournament/TeamRosterInputs";
import { getRoundNameByPositions } from "~/core/tournament/bracket";
import { db } from "~/utils/db.server";
import { v4 as uuidv4 } from "uuid";

export type FindMatchModalInfoByNumber =
  | {
      title: string;
      roundName: string;
      matchInfos: {
        idForReact: string;
        teamUpper: TeamRosterInputTeam;
        teamLower: TeamRosterInputTeam;
        winnerId?: string;
        stage: { name: string; mode: Mode };
      }[];
    }
  | undefined;

export async function findMatchModalInfoByNumber({
  bracketId,
  matchNumber,
}: {
  bracketId: string;
  matchNumber: number;
}): Promise<FindMatchModalInfoByNumber> {
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
    round.matches.find((match) => match.position === matchNumber)
  );
  const match = tournamentRound?.matches.find(
    (match) => match.position === matchNumber
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
        idForReact: uuidv4(),
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

  return {
    title: `${teamsOrdered[0].team.name} vs. ${teamsOrdered[1].team.name}`,
    roundName: getRoundNameByPositions(
      tournamentRound.position,
      tournamentRounds.map((round) => round.position)
    ),
    matchInfos,
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
  if (!stageResult) return { upperTeamMembers: [], lowerTeamMembers: [] };

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
