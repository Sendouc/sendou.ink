select
  "CalendarEventDate"."startTime"
from
  "CalendarEventDate"
where
  "CalendarEventDate"."startTime" between @startTime
  and @endTime