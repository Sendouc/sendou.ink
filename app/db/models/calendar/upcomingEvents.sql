select
  "CalendarEvent"."id" as "eventId",
  "CalendarEvent"."name" as "eventName",
  "CalendarEvent"."tags",
  "CalendarEventDate"."startTime",
  exists (
    select
      1
    from
      "CalendarEventBadge"
    where
      "CalendarEventBadge"."eventId" = "CalendarEvent"."id"
  ) as "hasBadge"
from
  "CalendarEventDate"
  inner join "CalendarEvent" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
where
  "CalendarEventDate"."startTime" > @now
group by
  "CalendarEventDate"."eventId"
order by
  "CalendarEventDate"."startTime" asc
limit
  3