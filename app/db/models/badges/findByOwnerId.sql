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
order by
  "Badge"."id" = (
    select
      "favoriteBadgeId"
    from
      "User"
    where
      "id" = @userId
  ) desc,
  "Badge"."id" asc
