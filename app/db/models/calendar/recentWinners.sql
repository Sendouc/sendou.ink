with "RecentEvents" as (
  select
    "CalendarEventResultTeam"."eventId",
    "CalendarEvent"."name" as "eventName",
    "CalendarEventResultTeam"."id" as "teamId",
    "CalendarEventDate"."startTime",
    "CalendarEventResultTeam"."name" as "teamName"
  from
    "CalendarEventDate"
    inner join "CalendarEventResultTeam" on "CalendarEventResultTeam"."eventId" = "CalendarEventDate"."eventId"
    and "CalendarEventResultTeam"."placement" = 1
    inner join "CalendarEvent" on "CalendarEvent"."id" = "CalendarEventResultTeam"."eventId"
  group by
    "CalendarEventDate"."eventId"
  order by
    "CalendarEventDate"."startTime" desc
  limit
    3
)
select
  "RecentEvents"."eventId",
  "RecentEvents"."eventName",
  "RecentEvents"."startTime",
  "RecentEvents"."teamName",
  "CalendarEventResultPlayer"."userId" as "playerId",
  "CalendarEventResultPlayer"."name" as "playerName",
  "User"."discordName" as "playerDiscordName",
  "User"."discordDiscriminator" as "playerDiscordDiscriminator",
  "User"."discordId" as "playerDiscordId",
  "User"."discordAvatar" as "playerDiscordAvatar"
from
  "RecentEvents"
  left join "CalendarEventResultPlayer" on "CalendarEventResultPlayer"."teamId" = "RecentEvents"."teamId"
  left join "User" on "User"."id" = "CalendarEventResultPlayer"."userId";