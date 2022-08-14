select
  "Badge"."code",
  "Badge"."displayName",
  "Badge"."id",
  "Badge"."hue",
  count("BadgeOwner"."badgeId") as count
from
  "BadgeOwner"
  join "Badge" on "Badge"."id" = "BadgeOwner"."badgeId"
where
  "BadgeOwner"."userId" = @userId
group by
  "BadgeOwner"."badgeId",
  "BadgeOwner"."userId"