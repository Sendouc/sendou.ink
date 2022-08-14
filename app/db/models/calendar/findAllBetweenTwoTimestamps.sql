select
  "CalendarEvent"."name",
  "CalendarEvent"."discordUrl",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."tags",
  "CalendarEventDate"."id" as "eventDateId",
  "CalendarEventDate"."eventId",
  "CalendarEventDate"."startTime",
  "User"."discordName",
  "User"."discordDiscriminator",
  "CalendarEventRanks"."nthAppearance",
  exists (
    select
      1
    from
      "CalendarEventBadge"
    where
      "CalendarEventBadge"."eventId" = "CalendarEventDate"."eventId"
  ) as "hasBadge"
from
  "CalendarEvent"
  join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
  join "User" on "CalendarEvent"."authorId" = "User"."id"
  join (
    select
      "id",
      "eventId",
      "startTime",
      rank() over(
        partition by "eventId"
        order by
          "startTime" asc
      ) "nthAppearance"
    from
      "CalendarEventDate"
  ) "CalendarEventRanks" on "CalendarEventDate"."id" = "CalendarEventRanks"."id"
where
  "CalendarEventDate"."startTime" between @startTime
  and @endTime
order by
  "CalendarEventDate"."startTime" asc