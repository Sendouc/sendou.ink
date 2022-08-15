delete from
  "PlusVote"
where
  "authorId" = @authorId
  and "month" = @month
  and "year" = @year