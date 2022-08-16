select
  "User"."id",
  "User"."discordId",
  "User"."discordName",
  "User"."discordDiscriminator",
  "PlusTier"."tier" as "plusTier"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"