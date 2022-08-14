select
  "CalendarEventResultPlayer"."name",
  "User"."id",
  "User"."discordName" as "discordName",
  "User"."discordDiscriminator" as "discordDiscriminator",
  "User"."discordId" as "discordId",
  "User"."discordAvatar" as "discordAvatar"
from
  "CalendarEventResultPlayer"
  left join "User" on "User"."id" = "CalendarEventResultPlayer"."userId"
where
  "teamId" = @teamId
  and (
    "CalendarEventResultPlayer"."userId" is null
    or "CalendarEventResultPlayer"."userId" != @userId
  )