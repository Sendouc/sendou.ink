select
  1
from
  "PlusVote"
where
  "authorId" = @userId
  and "month" = @month
  and "year" = @year