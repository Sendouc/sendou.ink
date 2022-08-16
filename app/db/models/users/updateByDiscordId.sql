update
  "User"
set
  "discordAvatar" = @discordAvatar,
  "discordName" = @discordName,
  "discordDiscriminator" = @discordDiscriminator
where
  "discordId" = @discordId