select
  "User"."id",
  "User"."discordId",
  "User"."discordName",
  "User"."discordDiscriminator"
from
  "BadgeManager"
  join "User" on "User"."id" = "BadgeManager"."userId"
where
  "BadgeManager"."badgeId" = @id