select
  "User"."id",
  "User"."discordId",
  "User"."discordName",
  "User"."discordDiscriminator",
  "User"."discordAvatar",
  "User"."bio"
from
  "User"
  join "PlusTier" on "User"."id" = "PlusTier"."userId"
where
  "PlusTier"."tier" = @plusTier