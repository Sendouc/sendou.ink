insert into
  "Tournament" ("mapPickingStyle", "format")
values
  (@mapPickingStyle, @format) returning *
