select
  "stageId",
  "mode"
from
  "MapPoolMap"
where
  "tieBreakerCalendarEventId" = @calendarEventId
