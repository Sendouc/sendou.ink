import type { Prisma } from "@prisma/client";
import { adjustSkills } from "~/core/mmr/utils";
import { db } from "~/utils/db.server";

export type FindById = Prisma.PromiseReturnType<typeof findById>;
export function findById(id: string) {
  return db.lfgGroupMatch.findUnique({
    where: { id },
    select: {
      stages: {
        select: {
          stage: {
            select: {
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

export async function reportScore({
  UNSAFE_matchId,
  UNSAFE_winnerGroupIds,
  playerIds,
  groupIds,
}: {
  UNSAFE_matchId: string;
  /** Group ID's in order of stages win */
  UNSAFE_winnerGroupIds: string[];
  playerIds: {
    winning: string[];
    losing: string[];
  };
  groupIds: string[];
}) {
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
    // https://stackoverflow.com/a/26715934
    db.$executeRawUnsafe(`
    update "LfgGroupMatchStage" as lfg set
      "winnerGroupId" = lfg2.winner_id
    from (values
      ${UNSAFE_winnerGroupIds.map(
        (winnerId, i) => `('${UNSAFE_matchId}', ${i + 1}, '${winnerId}')`
      ).join(",")}
    ) as lfg2(lfg_group_match_id, "order", winner_id)
    where lfg2.lfg_group_match_id = lfg."lfgGroupMatchId" and lfg2.order = lfg.order;
    `),
  ]);
}
