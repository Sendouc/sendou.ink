insert into
  "CalendarEvent" (
    "name",
    "authorId",
    "tags",
    "description",
    "discordInviteCode",
    "bracketUrl",
    "tournamentId"
  )
values
  (
    @name,
    @authorId,
    @tags,
    @description,
    @discordInviteCode,
    @bracketUrl,
    @tournamentId
  ) returning *
