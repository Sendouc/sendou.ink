import { sql } from "~/db/sql";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";

// xxx: tournament skills
const stm = sql.prepare(/* sql */ `
  select
    max("Skill"."ordinal") as "ordinal",
    date("GroupMatch"."createdAt", 'unixepoch') as "date"
  from
    "Skill"
  left join "GroupMatch" on "GroupMatch"."id" = "Skill"."groupMatchId"
  where
    "Skill"."userId" = @userId
    and "Skill"."season" = @season
    and "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
  group by "date"
  order by "date" asc
`);

export function seasonAllMMRByUserId({
  userId,
  season,
}: {
  userId: number;
  season: number;
}) {
  return stm.all({ userId, season }) as Array<{
    ordinal: number;
    date: string;
    isMostRecent: number;
  }>;
}
