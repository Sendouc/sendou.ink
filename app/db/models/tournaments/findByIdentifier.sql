select
  "CalendarEvent"."id",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."isBeforeStart",
  "CalendarEvent"."authorId",
  "CalendarEvent"."name"
from
  "CalendarEvent"
where
  (
    "id" = @identifier
    or "customUrl" = @identifier
  )
  and "CalendarEvent"."toToolsEnabled" = 1
