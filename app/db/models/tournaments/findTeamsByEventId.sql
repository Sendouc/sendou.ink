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
  ) as "members",
  json_group_array(
    json_object(
      'stageId',
      "MapPoolMap"."stageId",
      'mode',
      "MapPoolMap"."mode"
    )
  ) as "mapPool"
from
  "TournamentTeam"
  left join "TournamentTeamMember" on "TournamentTeamMember"."tournamentTeamId" = "TournamentTeam"."id"
  left join "MapPoolMap" on "MapPoolMap"."tournamentTeamId" = "TournamentTeam"."id"
where
  "TournamentTeam"."calendarEventId" = @calendarEventId
group by
  "TournamentTeam"."id"
