import { sql } from "~/db/sql";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";

const groupedSkillsStm = sql.prepare(/* sql */ `
  select
    max("Skill"."ordinal") as "ordinal",
    date(
      coalesce("GroupMatch"."createdAt", "CalendarEventDate"."startTime"), 'unixepoch'
    ) as "date"
  from
    "Skill"
  left join "GroupMatch" on "GroupMatch"."id" = "Skill"."groupMatchId"
  left join "Tournament" on "Tournament"."id" = "Skill"."tournamentId"
  -- TODO: support tournament having many start dates
  left join "CalendarEvent" on "Tournament"."id" = "CalendarEvent"."tournamentId"
  left join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
  where
    "Skill"."userId" = @userId
    and "Skill"."season" = @season
    and "Skill"."matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
    and ("GroupMatch"."id" is not null or "Tournament"."id" is not null)
  group by "date"
  order by "date" asc
`);

const mostRecentStm = sql.prepare(/* sql */ `
  select
    "Skill"."ordinal"
  from
    "Skill"
  where
    "Skill"."id" = (
      select max("id")
        from "Skill"
      where "userId" = @userId
        and "season" = @season
        and "matchesCount" >= ${MATCHES_COUNT_NEEDED_FOR_LEADERBOARD}
      group by "userId"
    )
`);

export function seasonAllMMRByUserId({
  userId,
  season,
}: {
  userId: number;
  season: number;
}) {
  return groupedSkillsStm.all({ userId, season }) as Array<{
    ordinal: number;
    date: string;
  }>;
}

export function currentMMRByUserId({
  userId,
  season,
}: {
  userId: number;
  season: number;
}) {
  return (
    mostRecentStm.get({ userId, season }) as {
      ordinal: number;
    } | null
  )?.ordinal;
}
