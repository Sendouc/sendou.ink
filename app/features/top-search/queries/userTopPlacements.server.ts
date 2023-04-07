import { sql } from "~/db/sql";
import type { XRankPlacement } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";

const smt = sql.prepare(/* sql */ `
  select
    "power",
    "rank",
    "mode",
    "playerId"
  from "XRankPlacement"
  left join "SplatoonPlayer" on "SplatoonPlayer"."id" = "XRankPlacement"."playerId"
  left join "User" on "User"."id" = "SplatoonPlayer"."userId"
  where
    "User"."id" = @userId
`);

type Row = Pick<XRankPlacement, "power" | "rank" | "mode" | "playerId">;
export const userTopPlacements = (userId: number) => {
  const rows = smt.all({ userId }) as Row[];

  const playerId = rows[0]?.playerId;

  return { topPlacements: resolveTopPlacements(rows), playerId };
};

type TopPlacements = Partial<
  Record<ModeShort, Pick<XRankPlacement, "power" | "rank">>
>;

function resolveTopPlacements(placements: Row[]) {
  const result: TopPlacements = {};

  for (const { mode, power, rank } of placements) {
    let current = result[mode];

    if (!current) {
      result[mode] = { power, rank };
      continue;
    }

    if (current.rank > rank) {
      const newResult = { ...current, rank };
      result[mode] = newResult;
      current = newResult;
    }

    if (current.power < power) {
      result[mode] = { ...current, power };
    }
  }

  return result;
}
