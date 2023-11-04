import { sql } from "~/db/sql.server";
import { LEADERBOARD_MAX_SIZE } from "../leaderboards-constants";
import type { User, XRankPlacement } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";

const getStm = (where = "") =>
  sql.prepare(/* sql */ `
  select
    "XRankPlacement"."id" as "entryId",
    "XRankPlacement"."playerId",
    "XRankPlacement"."weaponSplId",
    "XRankPlacement"."name",
    "User"."id",
    "User"."discordName",
    "User"."discordAvatar",
    "User"."discordDiscriminator",
    "User"."discordId",
    "User"."customUrl",
    max("XRankPlacement"."power") as "power",
    rank () over ( 
      order by "power" desc
    ) "placementRank"
  from "XRankPlacement"
  left join "SplatoonPlayer" on "SplatoonPlayer"."id" = "XRankPlacement"."playerId"
  left join "User" on "User"."id" = "SplatoonPlayer"."userId"
  ${where}
  group by "XRankPlacement"."playerId"
  order by "power" desc
  limit ${LEADERBOARD_MAX_SIZE}
`);

const allStm = getStm();
const modeStm = getStm(/* sql */ `
  where
    "XRankPlacement"."mode" = @mode
`);
const weaponStm = getStm(/* sql */ `
  where
    "XRankPlacement"."weaponSplId" = @weaponSplId
`);

export interface XPLeaderboardItem {
  entryId: number;
  power: number;
  id: User["id"];
  name: XRankPlacement["name"];
  playerId: XRankPlacement["playerId"];
  discordName: User["discordName"] | null;
  discordAvatar: User["discordAvatar"] | null;
  discordDiscriminator: User["discordDiscriminator"] | null;
  discordId: User["discordId"] | null;
  customUrl: User["customUrl"] | null;
  placementRank: number;
  weaponSplId: MainWeaponId;
}

export function allXPLeaderboard(): XPLeaderboardItem[] {
  return allStm.all() as any[];
}

export function modeXPLeaderboard(
  mode: XRankPlacement["mode"],
): XPLeaderboardItem[] {
  return modeStm.all({ mode }) as any[];
}

export function weaponXPLeaderboard(
  weaponSplId: MainWeaponId,
): XPLeaderboardItem[] {
  return weaponStm.all({ weaponSplId }) as any[];
}
