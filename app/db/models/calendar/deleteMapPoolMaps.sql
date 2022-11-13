delete from
  "MapPoolMap"
where
  "calendarEventId" = @calendarEventId
  or "tieBreakerCalendarEventId" = @calendarEventId
