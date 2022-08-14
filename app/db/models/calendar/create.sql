insert into
  "CalendarEvent" (
    "name",
    "authorId",
    "tags",
    "description",
    "discordInviteCode",
    "bracketUrl"
  )
values
  (
    @name,
    @authorId,
    @tags,
    @description,
    @discordInviteCode,
    @bracketUrl
  ) returning *