select
  "Badge"."id",
  "Badge"."code",
  "Badge"."displayName",
  "Badge"."hue"
from
  "BadgeManager"
  join "Badge" on "Badge"."id" = "BadgeManager"."badgeId"
where
  "userId" = @userId