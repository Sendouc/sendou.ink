select
  suggestion."id",
  suggestion."createdAt",
  suggestion."text",
  suggestion."tier",
  author."id" as "authorId",
  author."discordId" as "authorDiscordId",
  author."discordName" as "authorDiscordName",
  author."discordDiscriminator" as "authorDiscordDiscriminator",
  suggested."id" as "suggestedId",
  suggested."discordId" as "suggestedDiscordId",
  suggested."discordName" as "suggestedDiscordName",
  suggested."discordDiscriminator" as "suggestedDiscordDiscriminator",
  suggested."discordAvatar" as "suggestedDiscordAvatar",
  suggested."bio" as "suggestedBio"
from
  "PlusSuggestion" as suggestion
  join "User" as author on suggestion."authorId" = author."id"
  join "User" as suggested on suggestion."suggestedId" = suggested."id"
where
  "month" = @month
  and "year" = @year
  and "tier" >= @plusTier
order by
  suggestion."id" asc