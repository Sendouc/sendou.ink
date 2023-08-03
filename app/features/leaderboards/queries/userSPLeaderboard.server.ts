import { sql } from "~/db/sql";
import {
  LEADERBOARD_MAX_SIZE,
  MATCHES_COUNT_NEEDED_FOR_LEADERBOARD,
} from "../leaderboards-constants";
import type { User } from "~/db/types";
import { ordinalToSp } from "~/features/mmr";

const stm = sql.prepare(/* sql */ `
  select
    "Skill"."id" as "entryId",
    "Skill"."ordinal",
    "User"."id",
    "User"."discordName",
    "User"."discordAvatar",
    "User"."discordId",
    "User"."customUrl",
    rank () over ( 
      order by "Skill"."Ordinal" desc
    ) "placementRank"
  from 
    "Skill"
    left join "User" on "User"."id" = "Skill"."userId"
    inner join (
      select "userId", max("id") as "maxId"
      from "Skill"
      group by "userId"
    ) "Latest" on "Skill"."userId" = "Latest"."userId" and "Skill"."id" = "Latest"."maxId"
  where
    "Skill"."userId" is not null
    and "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
    and "Skill"."season" = @season
  order by
    "Skill"."ordinal" desc
  limit
    ${LEADERBOARD_MAX_SIZE}
`);

export interface UserSPLeaderboardItem {
  entryId: number;
  power: number;
  id: User["id"];
  discordName: User["discordName"];
  discordAvatar: User["discordAvatar"];
  discordId: User["discordId"];
  customUrl: User["customUrl"];
  placementRank: number;
}

export function userSPLeaderboard(season: number): UserSPLeaderboardItem[] {
  return (stm.all({ season }) as any[]).map(({ ordinal, ...rest }) => ({
    ...rest,
    power: ordinalToSp(ordinal),
  }));
}
