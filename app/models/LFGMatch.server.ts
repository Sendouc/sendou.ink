import { db } from "~/utils/db.server";

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
  matchId,
  winnerIds,
}: {
  matchId: string;
  winnerIds: string[];
}) {
  // https://stackoverflow.com/a/26715934
  return db.$executeRawUnsafe(`
  update "LfgGroupMatchStage" as lfg set
    "winnerGroupId" = lfg2.winner_id
  from (values
    ${winnerIds
      .map((winnerId, i) => `('${matchId}', ${i + 1}, '${winnerId}')`)
      .join(",")}
  ) as lfg2(lfg_group_match_id, "order", winner_id)
  where lfg2.lfg_group_match_id = lfg."lfgGroupMatchId" and lfg2.order = lfg.order;
`);
  // 1) update scores DONE
  // 2) update skill
  // 3) update team skill?
  // 4) if already reported error if different
}
