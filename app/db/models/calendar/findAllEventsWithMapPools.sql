select
  "CalendarEvent"."id", 
  "CalendarEvent"."name"
from
  "CalendarEvent"
  join "MapPoolMap" on "CalendarEvent"."id" = "MapPoolMap"."calendarEventId"
  left join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
group by
  "CalendarEvent"."id"
order by
  iif("CalendarEvent"."authorId" = @userId, 1 , 0) desc,
  min("CalendarEventDate"."startTime") desc