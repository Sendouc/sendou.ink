import { Prisma, PrismaClient, Skill } from "@prisma/client";
import { rating } from "openskill";
import {
  adjustSkills,
  adjustSkillsWithCancel,
  bracketToChangedMMRs,
} from "~/core/mmr/utils";
import { groupsToWinningAndLosingPlayerIds } from "~/core/play/utils";
import { Unpacked } from "~/utils";
import * as TournamentMatch from "~/models/TournamentMatch.server";

const prisma = new PrismaClient();

type UserId = string;
type CurrentSkills = Record<UserId, Pick<Skill, "mu" | "sigma">>;

async function main() {
  const matches = (await allMatches()).filter(
    (m) => m.stages.some((s) => s.winnerGroupId) || m.cancelCausingUserId
  );
  const tournaments = await allTournaments();

  const events = [...matches, ...tournaments].sort((a, b) => {
    const aDate = isTournament(a) ? a.startTime : a.createdAt;
    const bDate = isTournament(b) ? b.startTime : b.createdAt;

    return aDate.getTime() - bDate.getTime();
  });

  const newSkills: Omit<Skill, "id">[] = [];
  const currentSkills: CurrentSkills = {};

  for (const event of events) {
    const adjustedSkills = await getAdjustedSkills(event, currentSkills);

    newSkills.push(
      ...adjustedSkills.map((s) => ({
        ...s,
        matchId: isTournament(event) ? null : event.id,
        tournamentId: isTournament(event) ? event.id : null,
        createdAt: isTournament(event) ? event.startTime : event.createdAt,
        amountOfSets: s.amountOfSets,
      }))
    );

    for (const skill of adjustedSkills) {
      const { userId, ...rest } = skill;
      currentSkills[userId] = rest;
    }
  }

  await prisma.$transaction([
    prisma.skill.deleteMany(),
    prisma.skill.createMany({ data: newSkills }),
  ]);
}

async function getAdjustedSkills(
  event: Unpacked<AllTournaments> | Unpacked<AllMatches>,
  currentSkills: CurrentSkills
) {
  if (isTournament(event)) {
    // TODO: fix if can have many brackets
    const matches = await TournamentMatch.allTournamentMatchesWithRosterInfo(
      event.brackets[0].id
    );

    return bracketToChangedMMRs({
      matches,
      skills: Object.entries(currentSkills).map(([userId, skill]) => ({
        userId,
        ...skill,
      })),
    });
  }

  const skills = skillsPerUser({
    currentSkills,
    userIds: event.groups.flatMap((g) => g.members.flatMap((m) => m.memberId)),
  });
  const playerIds = groupsToWinningAndLosingPlayerIds({
    groups: event.groups.map((g) => ({
      id: g.id,
      members: g.members.map((m) => ({ user: { id: m.memberId } })),
    })),
    winnerGroupIds: event.stages.flatMap((s) =>
      s.winnerGroupId ? [s.winnerGroupId] : []
    ),
  });

  if (event.cancelCausingUserId) {
    return adjustSkillsWithCancel({
      skills,
      playerIds,
      noUpdateUserIds: playerIds.losing.filter(
        (id) => id !== event.cancelCausingUserId
      ),
    }).map((s) => ({ ...s, amountOfSets: null }));
  }

  return adjustSkills({
    skills,
    playerIds,
  }).map((s) => ({ ...s, amountOfSets: null }));
}

export type AllMatches = Prisma.PromiseReturnType<typeof allMatches>;
function allMatches() {
  return prisma.lfgGroupMatch.findMany({
    include: { stages: true, groups: { include: { members: true } } },
  });
}

export type AllTournaments = Prisma.PromiseReturnType<typeof allTournaments>;
function allTournaments() {
  return prisma.tournament.findMany({
    where: {
      concluded: true,
    },
    include: { brackets: { select: { id: true } } },
  });
}

function isTournament(
  event: Unpacked<AllTournaments> | Unpacked<AllMatches>
): event is Unpacked<AllTournaments> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  return Boolean((event as any).startTime);
}

function skillsPerUser({
  currentSkills,
  userIds,
}: {
  currentSkills: CurrentSkills;
  userIds: string[];
}): Pick<Skill, "userId" | "mu" | "sigma">[] {
  return userIds.map((id) => {
    const skill = currentSkills[id] ? currentSkills[id] : rating();
    return { userId: id, ...skill };
  });
}

main()
  // eslint-disable-next-line no-console
  .then(() => console.log("done"))
  .catch((e) => console.error(e));
