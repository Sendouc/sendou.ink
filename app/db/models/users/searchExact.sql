select
  "id",
  "discordName",
  "discordId",
  "discordAvatar",
  "discordDiscriminator",
  "discordUniqueName",
  "showDiscordUniqueName",
  "customUrl",
  "inGameName",
  "PlusTier"."tier" as "plusTier"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"
where
  "discordId" = @discordId
  or "customUrl" = @customUrl
  or "id" = @id
