insert into
  "User" (
    "discordId",
    "discordName",
    "discordDiscriminator",
    "discordAvatar",
    "twitch",
    "twitter",
    "youtubeId",
    "inGameName"
  )
values
  (
    @discordId,
    @discordName,
    @discordDiscriminator,
    @discordAvatar,
    @twitch,
    @twitter,
    @youtubeId,
    @inGameName
  ) on conflict("discordId") do
update
set
  "discordName" = excluded."discordName",
  "discordDiscriminator" = excluded."discordDiscriminator",
  "discordAvatar" = excluded."discordAvatar",
  "twitch" = excluded."twitch",
  "twitter" = excluded."twitter",
  "youtubeId" = excluded."youtubeId" returning *
