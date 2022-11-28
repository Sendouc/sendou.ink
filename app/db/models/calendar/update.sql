update
  "CalendarEvent"
set
  "name" = @name,
  "tags" = @tags,
  "description" = @description,
  "discordInviteCode" = @discordInviteCode,
  "bracketUrl" = @bracketUrl,
  "toToolsEnabled" = @toToolsEnabled
where
  "id" = @eventId
