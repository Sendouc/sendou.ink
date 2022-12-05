select
  "discordName",
  "discordId",
  "discordAvatar",
  "discordDiscriminator",
  "customUrl",
  "inGameName"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"
where
  "discordName" like @discordName
  or "inGameName" like @inGameName
  or "twitter" like @twitter
order by
  case
    when "PlusTier"."tier" is null then 4
    else "PlusTier"."tier"
  end asc
limit
  25
