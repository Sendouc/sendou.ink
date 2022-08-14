select
  count("BadgeOwner"."badgeId") as count,
  "User"."id",
  "User"."discordId",
  "User"."discordName",
  "User"."discordDiscriminator"
from
  "BadgeOwner"
  join "User" on "User"."id" = "BadgeOwner"."userId"
where
  "BadgeOwner"."badgeId" = @id
group by
  "User"."id"
order by
  count desc,
  "User"."discordName" collate nocase asc