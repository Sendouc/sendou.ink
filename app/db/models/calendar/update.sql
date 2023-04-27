update
  "CalendarEvent"
set
  "name" = @name,
  "tags" = @tags,
  "description" = @description,
  "discordInviteCode" = @discordInviteCode,
  "bracketUrl" = @bracketUrl,
  "tournamentId" = @tournamentId
where
  "id" = @eventId
