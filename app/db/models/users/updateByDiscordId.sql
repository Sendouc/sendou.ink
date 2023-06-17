update
  "User"
set
  "discordAvatar" = @discordAvatar,
  "discordName" = coalesce(@discordName, "discordName"),
  "discordUniqueName" = coalesce(@discordUniqueName, "discordUniqueName")
where
  "discordId" = @discordId
