select
  count(*) as "count"
from
  "Build"
where
  "Build"."ownerId" = @userId
  and (
    "Build"."private" = 0
    or "Build"."ownerId" = @loggedInUserId
  )
