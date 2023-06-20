insert into
  "User" (
    "discordId",
    "discordName",
    "discordDiscriminator",
    "discordAvatar",
    "discordUniqueName",
    "twitch",
    "twitter",
    "youtubeId"
  )
values
  (
    @discordId,
    @discordName,
    @discordDiscriminator,
    @discordAvatar,
    @discordUniqueName,
    @twitch,
    @twitter,
    @youtubeId
  ) on conflict("discordId") do
update
set
  "discordName" = excluded."discordName",
  "discordDiscriminator" = excluded."discordDiscriminator",
  "discordAvatar" = excluded."discordAvatar",
  "discordUniqueName" = excluded."discordUniqueName",
  "twitch" = excluded."twitch",
  "twitter" = excluded."twitter",
  "youtubeId" = excluded."youtubeId" returning *
