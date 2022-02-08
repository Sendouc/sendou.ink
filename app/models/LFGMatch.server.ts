import type { Prisma } from "@prisma/client";
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

export function reportScore({
  UNSAFE_matchId,
  UNSAFE_winnerIds,
}: {
  UNSAFE_matchId: string;
  UNSAFE_winnerIds: string[];
}) {
  // https://stackoverflow.com/a/26715934
  return db.$executeRawUnsafe(`
  update "LfgGroupMatchStage" as lfg set
    "winnerGroupId" = lfg2.winner_id
  from (values
    ${UNSAFE_winnerIds.map(
      (winnerId, i) => `('${UNSAFE_matchId}', ${i + 1}, '${winnerId}')`
    ).join(",")}
  ) as lfg2(lfg_group_match_id, "order", winner_id)
  where lfg2.lfg_group_match_id = lfg."lfgGroupMatchId" and lfg2.order = lfg.order;
`);
  // 1) update scores DONE
  // 2) update skill
  // 3) update team skill?
  // 4) if already reported error if different
}
