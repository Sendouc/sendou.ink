insert into
  "TournamentTeam" ("name", "createdAt", "calendarEventId")
values
  (@name, @createdAt, @calendarEventId) returning *
