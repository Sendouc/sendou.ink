import { sql } from "~/db/sql";
import type { SplatoonPlacement } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    p."weaponSplId",
    p."name",
    p."power",
    p."rank"
  from
    "SplatoonPlacement" p
  where
    p."type" = @type,
    p."mode" = @mode,
    p."region" = @region,
    p."month" = @month,
    p."year" = @year
  order by
    p."rank" asc
`);

type FindPlacement = Pick<
  SplatoonPlacement,
  "weaponSplId" | "name" | "power" | "rank"
>;

export function findPlacements(
  args: Pick<SplatoonPlacement, "type" | "mode" | "region" | "month" | "year">
) {
  return stm.all(args) as Array<FindPlacement>;
}
