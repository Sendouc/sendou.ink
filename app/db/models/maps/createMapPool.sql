insert into
  "MapPool" ("code", "ownerId")
values
  (@code, @ownerId) returning *
