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
    "User"."discordDiscriminator",
    "User"."discordId",
    "User"."customUrl"
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
  discordDiscriminator: User["discordDiscriminator"];
  discordId: User["discordId"];
  customUrl: User["customUrl"];
}

export function userSPLeaderboard(): UserSPLeaderboardItem[] {
  return (stm.all() as any[]).map(({ ordinal, ...rest }) => ({
    ...rest,
    power: ordinalToSp(ordinal),
  }));
}
