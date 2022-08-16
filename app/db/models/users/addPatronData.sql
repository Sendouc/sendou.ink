update
  "User"
set
  "patronTier" = @patronTier,
  "patronSince" = @patronSince
where
  "discordId" = @discordId