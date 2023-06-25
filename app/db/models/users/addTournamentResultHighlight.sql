update
  "TournamentResult"
set
  "isHighlight" = 1
where
  "userId" = @userId
  and "tournamentTeamId" = @tournamentTeamId
