select
  "CalendarEvent"."id",
  "CalendarEvent"."name",
  (
    select
      max("startTime")
    from
      "CalendarEventDate"
    where
      "eventId" = "CalendarEvent"."id"
  ) as "startTime"
from
  "CalendarEvent"
where
  "CalendarEvent"."authorId" = @authorId
  and "startTime" > @lowerLimitTime
  and "startTime" < @upperLimitTime
  and "CalendarEvent"."participantCount" is null