insert into
  "CalendarEvent" (
    "name",
    "authorId",
    "tags",
    "description",
    "discordInviteCode",
    "bracketUrl",
    "toToolsEnabled"
  )
values
  (
    @name,
    @authorId,
    @tags,
    @description,
    @discordInviteCode,
    @bracketUrl,
    @toToolsEnabled
  ) returning *
