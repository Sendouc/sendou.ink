select
  "CalendarEvent"."id",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."authorId",
  "User"."discordName",
  "User"."discordDiscriminator",
  "User"."discordId",
  "CalendarEvent"."name",
  "CalendarEvent"."description"
from
  "CalendarEvent"
  left join "User" on "CalendarEvent"."authorId" = "User"."id"
where
  (
    "CalendarEvent"."id" = @identifier
    or "CalendarEvent"."customUrl" = @identifier
  )
  and "CalendarEvent"."toToolsEnabled" = 1
