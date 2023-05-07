import { sql } from "~/db/sql";

const stm = sql.prepare(/*sql*/ `
  select
    "User"."id",
    max("XRankPlacement"."power") as "xPower"
  from "User"
  right join "SplatoonPlayer" on "SplatoonPlayer"."userId" = "User"."id"
  left join "XRankPlacement" on "XRankPlacement"."playerId" = "SplatoonPlayer"."id"
  where "User"."id" is not null
  group by "User"."id"
`);

export const maxXPowers = () => {
  const rows = stm.all() as { id: number; xPower: number }[];

  return rows.reduce((acc, row) => {
    acc[row.id] = row.xPower;
    return acc;
  }, {} as Record<number, number>);
};
