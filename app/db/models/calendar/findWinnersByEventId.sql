select
  "CalendarEventResultTeam"."id",
  "CalendarEventResultTeam"."name" as "teamName",
  "CalendarEventResultTeam"."placement",
  "CalendarEventResultPlayer"."userId" as "playerId",
  "CalendarEventResultPlayer"."name" as "playerName",
  "User"."discordName" as "playerDiscordName",
  "User"."discordDiscriminator" as "playerDiscordDiscriminator",
  "User"."discordId" as "playerDiscordId",
  "User"."discordAvatar" as "playerDiscordAvatar"
from
  "CalendarEventResultTeam"
  left join "CalendarEventResultPlayer" on "CalendarEventResultPlayer"."teamId" = "CalendarEventResultTeam"."id"
  left join "User" on "User"."id" = "CalendarEventResultPlayer"."userId"
where
  "CalendarEventResultTeam"."eventId" = @eventId
order by
  "CalendarEventResultTeam"."placement" asc