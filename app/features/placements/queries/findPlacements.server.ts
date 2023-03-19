import { sql } from "~/db/sql";
import type { SplatoonPlacement } from "~/db/types";

const query = (byPlayer?: boolean) => /* sql */ `
  select
    "id",
    "weaponSplId",
    "name",
    "power",
    "rank",
    "team",
    "month",
    "year",
    "type",
    "region",
    "playerId",
    "month", 
    "year", 
    "mode"
  from
    "SplatoonPlacement"
  ${
    byPlayer
      ? /* sql */ `
  where
    "playerId" = @playerId
  order by
    "year" desc,
    "month" desc,
    "rank" asc
        `
      : /* sql */ `
  where
    "type" = @type and
    "mode" = @mode and
    "region" = @region and
    "month" = @month and
    "year" = @year
  order by
    "rank" asc`
  }
`;

const ofMonthStm = sql.prepare(query());
const byPlayerStm = sql.prepare(query(true));

export type FindPlacement = Pick<
  SplatoonPlacement,
  | "id"
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
  | "month"
  | "year"
  | "mode"
>;

export function findPlacementsOfMonth(
  args: Pick<SplatoonPlacement, "type" | "mode" | "region" | "month" | "year">
) {
  return ofMonthStm.all(args) as Array<FindPlacement>;
}

export function findPlacementsByPlayerId(
  playerId: SplatoonPlacement["playerId"]
) {
  const results = byPlayerStm.all({ playerId }) as Array<FindPlacement>;
  if (!results) return null;

  return results;
}
