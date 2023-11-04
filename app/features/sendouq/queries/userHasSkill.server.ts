import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  select
    1
  from 
    "Skill"
  where
    "Skill"."userId" = @userId
    and "Skill"."season" = @season
  limit 1
`);

export function userHasSkill({
  userId,
  season,
}: {
  userId: number;
  season: number;
}) {
  const rows = stm.all({ userId, season });

  return rows.length > 0;
}
