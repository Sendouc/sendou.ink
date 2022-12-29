select
  "User".*,
  "PlusTier"."tier" as "plusTier",
  json_group_array("UserWeapon"."weaponSplId") as "weapons"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"
  left join "UserWeapon" on "UserWeapon"."userId" = "User"."id"
where
  "discordId" = @identifier
  or "id" = @identifier
  or "customUrl" = @identifier
order by
  "UserWeapon"."order" asc
