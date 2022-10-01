select
  "User".*,
  "PlusTier"."tier" as "plusTier"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"
where
  "discordId" = @identifier
  or "id" = @identifier
  or "customUrl" = @identifier
