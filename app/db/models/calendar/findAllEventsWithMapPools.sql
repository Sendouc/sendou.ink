select
  "CalendarEvent"."id", 
  "CalendarEvent"."name",
  json_group_array(
    json_object(
      'stageId',
      "MapPoolMap"."stageId",
      'mode',
      "MapPoolMap"."mode"
    )
  ) as "mapPool"
from
  "CalendarEvent"
  join "MapPoolMap" on "CalendarEvent"."id" = "MapPoolMap"."calendarEventId"
group by
  "CalendarEvent"."id"
order by
  "CalendarEvent"."id" desc