import { sql } from "~/db/sql";
import type { SplatoonPlacement, User } from "~/db/types";

const query = (byPlayer?: boolean) => /* sql */ `
  select
    "SplatoonPlacement"."id",
    "SplatoonPlacement"."weaponSplId",
    "SplatoonPlacement"."name",
    "SplatoonPlacement"."power",
    "SplatoonPlacement"."rank",
    "SplatoonPlacement"."team",
    "SplatoonPlacement"."month",
    "SplatoonPlacement"."year",
    "SplatoonPlacement"."type",
    "SplatoonPlacement"."region",
    "SplatoonPlacement"."playerId",
    "SplatoonPlacement"."month", 
    "SplatoonPlacement"."year", 
    "SplatoonPlacement"."mode",
    "User"."discordId",
    "User"."customUrl"
  from
    "SplatoonPlacement"
  left join "SplatoonPlayer" on
    "SplatoonPlayer"."id" = "SplatoonPlacement"."playerId"
  left join "User" on
    "User"."id" = "SplatoonPlayer"."userId"
  ${
    byPlayer
      ? /* sql */ `
  where
    "SplatoonPlacement"."playerId" = @playerId
  order by
    "SplatoonPlacement"."year" desc,
    "SplatoonPlacement"."month" desc,
    "SplatoonPlacement"."rank" asc
        `
      : /* sql */ `
  where
    "SplatoonPlacement"."type" = @type and
    "SplatoonPlacement"."mode" = @mode and
    "SplatoonPlacement"."region" = @region and
    "SplatoonPlacement"."month" = @month and
    "SplatoonPlacement"."year" = @year
  order by
    "SplatoonPlacement"."rank" asc`
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
> &
  Pick<User, "customUrl" | "discordId">;

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
