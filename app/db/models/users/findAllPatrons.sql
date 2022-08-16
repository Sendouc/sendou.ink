select
  "id",
  "discordId",
  "discordName",
  "discordDiscriminator",
  "patronTier"
from
  "User"
where
  "patronTier" is not null
order by
  "patronTier" desc,
  "patronSince" asc