select
  count(*) as "memberCount"
from
  "TournamentTeam"
  left join "TournamentTeamMember" on "TournamentTeamMember"."tournamentTeamId" = "TournamentTeam"."id"
where
  "TournamentTeam"."tournamentId" = @tournamentId
group by
  "TournamentTeam"."id";
