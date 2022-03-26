import { Prisma, PrismaClient } from "@prisma/client";
import { rating } from "openskill";
import { adjustSkills } from "~/core/mmr/utils";
import { groupsToWinningAndLosingPlayerIds } from "~/core/play/utils";

const prisma = new PrismaClient();

type SkillWithDetails = {
  mu: number;
  sigma: number;
  userId: string;
  matchId: string;
};
type UserId = string;
type CurrentSkills = Record<UserId, Pick<SkillWithDetails, "mu" | "sigma">>;

async function main() {
  const matches = (await allMatches()).filter((m) =>
    m.stages.some((s) => s.winnerGroupId)
  );

  const newSkills: SkillWithDetails[] = [];
  const currentSkills: CurrentSkills = {};

  for (const match of matches) {
    const adjustedSkills = adjustSkills({
      skills: skillsPerUser({
        currentSkills,
        userIds: match.groups.flatMap((g) =>
          g.members.flatMap((m) => m.memberId)
        ),
      }),
      playerIds: groupsToWinningAndLosingPlayerIds({
        groups: match.groups.map((g) => ({
          id: g.id,
          members: g.members.map((m) => ({ user: { id: m.memberId } })),
        })),
        winnerGroupIds: match.stages.flatMap((s) =>
          s.winnerGroupId ? [s.winnerGroupId] : []
        ),
      }),
    });

    newSkills.push(...adjustedSkills.map((s) => ({ ...s, matchId: match.id })));

    for (const skill of adjustedSkills) {
      const { userId, ...rest } = skill;
      currentSkills[userId] = rest;
    }
  }

  await prisma.$transaction([
    prisma.skill.deleteMany({}),
    prisma.skill.createMany({ data: newSkills }),
  ]);
}

export type AllMatches = Prisma.PromiseReturnType<typeof allMatches>;
function allMatches() {
  return prisma.lfgGroupMatch.findMany({
    include: { stages: true, groups: { include: { members: true } } },
    orderBy: { createdAt: "asc" },
  });
}

function skillsPerUser({
  currentSkills,
  userIds,
}: {
  currentSkills: CurrentSkills;
  userIds: string[];
}): Omit<SkillWithDetails, "matchId">[] {
  return userIds.map((id) => {
    const skill = currentSkills[id] ? currentSkills[id] : rating();
    return { userId: id, ...skill };
  });
}

main()
  // eslint-disable-next-line no-console
  .then(() => console.log("done"))
  .catch((e) => console.error(e));
