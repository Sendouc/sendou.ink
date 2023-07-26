import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";

const userStm = sql.prepare(/* sql */ `
  select
    "Skill"."ordinal"
  from
    "Skill"
  inner join (
    select "userId", max("id") as "maxId"
    from "Skill"
    group by "userId"
  ) "Latest" on "Skill"."userId" = "Latest"."userId" and "Skill"."id" = "Latest"."maxId"
  where
    "Skill"."season" = @season
    and "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
    and "Skill"."userId" is not null
  order by
    "Skill"."ordinal" desc
`);

const teamStm = sql.prepare(/* sql */ `
  select
    "Skill"."ordinal"
  from
    "Skill"
  inner join (
    select "identifier", max("id") as "maxId"
    from "Skill"
    group by "identifier"
  ) "Latest" on "Skill"."identifier" = "Latest"."identifier" and "Skill"."id" = "Latest"."maxId"
  where
    "Skill"."season" = @season
    and "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
    and "Skill"."identifier" is not null
  order by
    "Skill"."ordinal" desc
`);

export function orderedMMRBySeason({
  season,
  type,
}: {
  season: number;
  type: "team" | "user";
}) {
  const stm = type === "team" ? teamStm : userStm;

  return stm.all({ season }) as Array<Pick<Skill, "ordinal">>;
}
