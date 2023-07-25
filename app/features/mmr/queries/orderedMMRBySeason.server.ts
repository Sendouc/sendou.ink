import { sql } from "~/db/sql";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";

// xxx: next inner join
const stm = sql.prepare(/* sql */ `
  select
    "Skill"."ordinal"
  from
    "Skill"
  order by
    "Skill"."ordinal" desc
  where
    "Skill"."season" = @season
    and "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
`);
