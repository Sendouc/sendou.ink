insert into
  "CalendarEventResultTeam" ("eventId", "name", "placement")
values
  (@eventId, @name, @placement) returning *