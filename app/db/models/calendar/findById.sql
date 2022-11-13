select
  "CalendarEvent"."name",
  "CalendarEvent"."description",
  "CalendarEvent"."discordInviteCode",
  "CalendarEvent"."discordUrl",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."tags",
  "CalendarEvent"."participantCount",
  "CalendarEvent"."toToolsEnabled",
  "User"."id" as "authorId",
  exists (
    select
      1
    from
      "CalendarEventBadge"
    where
      "CalendarEventBadge"."eventId" = "CalendarEventDate"."eventId"
  ) as "hasBadge",
  "CalendarEventDate"."startTime",
  "CalendarEventDate"."eventId",
  "User"."discordName",
  "User"."discordDiscriminator",
  "User"."discordId",
  "User"."discordAvatar"
from
  "CalendarEvent"
  join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
  join "User" on "CalendarEvent"."authorId" = "User"."id"
where
  "CalendarEvent"."id" = @id
order by
  "CalendarEventDate"."startTime" asc
