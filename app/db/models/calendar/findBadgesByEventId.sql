select
  "Badge"."id",
  "Badge"."code",
  "Badge"."hue",
  "Badge"."displayName"
from
  "CalendarEventBadge"
  join "Badge" on "CalendarEventBadge"."badgeId" = "Badge"."id"
where
  "CalendarEventBadge"."eventId" = @eventId