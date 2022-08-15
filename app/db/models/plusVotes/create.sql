insert into
  "PlusVote" (
    "month",
    "year",
    "tier",
    "authorId",
    "votedId",
    "score",
    "validAfter"
  )
values
  (
    @month,
    @year,
    @tier,
    @authorId,
    @votedId,
    @score,
    @validAfter
  )