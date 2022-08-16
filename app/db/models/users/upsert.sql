insert into
  "User" (
    "discordId",
    "discordName",
    "discordDiscriminator",
    "discordAvatar",
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
    @twitch,
    @twitter,
    @youtubeId
  ) on conflict("discordId") do
update
set
  "discordName" = excluded."discordName",
  "discordDiscriminator" = excluded."discordDiscriminator",
  "discordAvatar" = excluded."discordAvatar",
  "twitch" = excluded."twitch",
  "twitch" = excluded."twitch",
  "youtubeId" = excluded."youtubeId" returning *