import { sql } from "~/db/sql";

// xxx: dates
const stm = sql.prepare(/* sql */ `
  select
    "Skill"."ordinal"
  from
    "Skill"
  where
    "Skill"."userId" = @userId
    and "Skill"."season" = @season
  order by
    "Skill"."id" desc
`);

export function seasonAllMMRByUserId({
  userId,
  season,
}: {
  userId: number;
  season: number;
}) {
  return stm.all({ userId, season }) as Array<{ ordinal: number }>;
}
