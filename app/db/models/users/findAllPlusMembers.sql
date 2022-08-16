select
  "User"."discordId",
  "PlusTier"."tier" as "plusTier"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"
where
  "PlusTier"."tier" is not null