insert into
  "User" (
    "discordId",
    "discordName",
    "discordDiscriminator",
    "discordAvatar",
    "discordUniqueName"
  )
values
  (
    @discordId,
    @discordName,
    @discordDiscriminator,
    @discordAvatar,
    @discordUniqueName
  ) on conflict("discordId") do
update
set
  "discordName" = excluded."discordName",
  "discordDiscriminator" = excluded."discordDiscriminator",
  "discordAvatar" = excluded."discordAvatar",
  "discordUniqueName" = excluded."discordUniqueName" returning *
