delete from
  "TournamentTeamMember"
where
  "userId" = @userId
  and "tournamentTeamId" = @tournamentTeamId;
