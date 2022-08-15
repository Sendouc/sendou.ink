select
  "PlusVotingResult"."wasSuggested",
  "PlusVotingResult"."passedVoting",
  "PlusVotingResult"."tier",
  "PlusVotingResult"."score",
  "User"."id",
  "User"."discordAvatar",
  "User"."discordDiscriminator",
  "User"."discordName",
  "User"."discordId"
from
  "PlusVotingResult"
  join "User" on "PlusVotingResult"."votedId" = "User".id
where
  "PlusVotingResult"."month" = @month
  and "PlusVotingResult"."year" = @year
order by
  "User"."discordName" collate nocase asc