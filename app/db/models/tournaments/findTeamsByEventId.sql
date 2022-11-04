select
  "id",
  "name",
  json_group_array(
    json_object(
      'userId',
      "TournamentTeamMember"."userId",
      'isOwner',
      "TournamentTeamMember"."isOwner"
    )
  ) as "members"
from
  "TournamentTeam"
  left join "TournamentTeamMember" on "TournamentTeamMember"."tournamentTeamId" = "TournamentTeam"."id"
where
  "calendarEventId" = @calendarEventId
group by
  "TournamentTeam"."id"
