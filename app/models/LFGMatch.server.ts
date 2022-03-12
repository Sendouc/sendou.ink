import type { Prisma } from "@prisma/client";
import { adjustSkills } from "~/core/mmr/utils";
import { db } from "~/utils/db.server";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.lfgGroupMatch.findUnique({
    where: { id },
    select: {
      createdAt: true,
      stages: {
        select: {
          id: true,
          stage: {
            select: {
              id: true,
              name: true,
              mode: true,
            },
          },
          winnerGroupId: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      groups: { include: { members: { include: { user: true } } } },
    },
  });
}

export function findByUserId({ userId }: { userId: string }) {
  return db.lfgGroupMatch.findMany({
    where: {
      groups: {
        some: {
          members: {
            some: {
              memberId: userId,
            },
          },
        },
      },
      stages: {
        some: {
          winnerGroupId: {
            not: null,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      groups: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
      stages: true,
    },
  });
}

export type RecentOfUser = Prisma.PromiseReturnType<typeof recentOfUser>;
export function recentOfUser(userId: string) {
  const twoHoursAgo = () => {
    const result = new Date();
    result.setHours(result.getHours() - 2);

    return result;
  };
  return db.lfgGroupMatch.findFirst({
    where: {
      groups: {
        some: {
          members: {
            some: {
              memberId: userId,
            },
          },
        },
      },
      createdAt: {
        gte: twoHoursAgo(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      groups: {
        include: {
          members: true,
        },
      },
    },
  });
}

interface ReportScoreArgs {
  UNSAFE_matchId: string;
  /** Group ID's in order of stages win */
  UNSAFE_winnerGroupIds: string[];
  playerIds: {
    winning: string[];
    losing: string[];
  };
  groupIds: string[];
}
export async function reportScore({
  UNSAFE_matchId,
  UNSAFE_winnerGroupIds,
  playerIds,
  groupIds,
}: ReportScoreArgs) {
  const allPlayerIds = [...playerIds.winning, ...playerIds.losing];
  const skills = await db.skill.findMany({
    where: { userId: { in: allPlayerIds } },
    orderBy: {
      createdAt: "desc",
    },
    distinct: "userId",
  });

  const adjustedSkills = adjustSkills({ skills, playerIds });

  return db.$transaction([
    db.skill.createMany({
      data: adjustedSkills.map((s) => ({ ...s, matchId: UNSAFE_matchId })),
    }),
    db.lfgGroup.updateMany({
      where: {
        id: {
          in: groupIds,
        },
      },
      data: {
        status: "INACTIVE",
      },
    }),
    insertScores({ UNSAFE_matchId, UNSAFE_winnerGroupIds }),
  ]);
}

export async function overrideScores({
  UNSAFE_matchId,
  UNSAFE_winnerGroupIds,
}: Pick<ReportScoreArgs, "UNSAFE_matchId" | "UNSAFE_winnerGroupIds">) {
  return db.$transaction([
    db.lfgGroupMatchStage.updateMany({
      where: { lfgGroupMatchId: UNSAFE_matchId },
      data: { winnerGroupId: null },
    }),
    insertScores({
      UNSAFE_matchId,
      UNSAFE_winnerGroupIds,
    }),
  ]);
}

export function deleteMatch(id: string) {
  return db.$transaction([
    db.lfgGroupMatchStage.deleteMany({ where: { lfgGroupMatchId: id } }),
    db.lfgGroupMatch.delete({ where: { id } }),
  ]);
}

function insertScores({
  UNSAFE_matchId,
  UNSAFE_winnerGroupIds,
}: Pick<ReportScoreArgs, "UNSAFE_matchId" | "UNSAFE_winnerGroupIds">) {
  // https://stackoverflow.com/a/26715934
  return db.$executeRawUnsafe(`
    update "LfgGroupMatchStage" as lfg set
      "winnerGroupId" = lfg2.winner_id
    from (values
      ${UNSAFE_winnerGroupIds.map(
        (winnerId, i) => `('${UNSAFE_matchId}', ${i + 1}, '${winnerId}')`
      ).join(",")}
    ) as lfg2(lfg_group_match_id, "order", winner_id)
    where lfg2.lfg_group_match_id = lfg."lfgGroupMatchId" and lfg2.order = lfg.order;
    `);
}
