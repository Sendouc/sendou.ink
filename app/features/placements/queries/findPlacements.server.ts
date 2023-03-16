import { sql } from "~/db/sql";
import type { SplatoonPlacement } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "weaponSplId",
    "name",
    "power",
    "rank",
    "team",
    "month",
    "year",
    "type",
    "region",
    "playerId"
  from
    "SplatoonPlacement"
  where
    "type" = @type and
    "mode" = @mode and
    "region" = @region and
    "month" = @month and
    "year" = @year
  order by
    "rank" asc
`);

type FindPlacement = Pick<
  SplatoonPlacement,
  | "weaponSplId"
  | "name"
  | "power"
  | "rank"
  | "team"
  | "month"
  | "year"
  | "type"
  | "region"
  | "playerId"
>;

export function findPlacements(
  args: Pick<SplatoonPlacement, "type" | "mode" | "region" | "month" | "year">
) {
  return stm.all(args) as Array<FindPlacement>;
}
