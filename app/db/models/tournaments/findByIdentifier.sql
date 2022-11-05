select
  "CalendarEvent"."id",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."isBeforeStart"
from
  "CalendarEvent"
where
  (
    "id" = @identifier
    or "customUrl" = @identifier
  )
  and "CalendarEvent"."toToolsEnabled" = 1
