insert into
  "CalendarEvent" (
    "name",
    "authorId",
    "tags",
    "description",
    "discordInviteCode",
    "bracketUrl",
    "toToolsEnabled",
    "toToolsMode"
  )
values
  (
    @name,
    @authorId,
    @tags,
    @description,
    @discordInviteCode,
    @bracketUrl,
    @toToolsEnabled,
    @toToolsMode
  ) returning *
