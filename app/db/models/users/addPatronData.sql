update
  "User"
set
  "patronTier" = @patronTier,
  "patronSince" = @patronSince,
  "patronTill" = null
where
  "discordId" = @discordId
