select
  count(*)
from
  "Build"
where
  "ownerId" = @userId;