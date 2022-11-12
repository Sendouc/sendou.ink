select
  "CalendarEvent"."id",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."isBeforeStart",
  "CalendarEvent"."authorId"
from
  "CalendarEvent"
where
  (
    "id" = @identifier
    or "customUrl" = @identifier
  )
  and "CalendarEvent"."toToolsEnabled" = 1
