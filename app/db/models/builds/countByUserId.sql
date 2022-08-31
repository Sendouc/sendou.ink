select
  count(*) as "count"
from
  "Build"
where
  "ownerId" = @userId;