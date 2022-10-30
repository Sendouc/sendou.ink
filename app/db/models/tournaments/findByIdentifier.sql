select
  "CalendarEvent"."bracketUrl"
from
  "CalendarEvent"
where
  "id" = @identifier
  or "customUrl" = @identifier
