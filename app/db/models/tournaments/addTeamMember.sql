insert into
  "TournamentTeamMember" (
    "tournamentTeamId",
    "userId",
    "isOwner",
    "createdAt"
  )
values
  (@tournamentTeamId, @userId, @isOwner, @createdAt);
