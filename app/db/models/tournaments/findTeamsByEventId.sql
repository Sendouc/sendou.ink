with "TeamWithMembers" as (
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
    "TournamentTeam"."calendarEventId" = @calendarEventId
  group by
    "TournamentTeam"."id"
)
select
  "TeamWithMembers".*,
  json_group_array(
    json_object(
      'stageId',
      "MapPoolMap"."stageId",
      'mode',
      "MapPoolMap"."mode"
    )
  ) as "mapPool"
from
  "TeamWithMembers"
  left join "MapPoolMap" on "MapPoolMap"."tournamentTeamId" = "TeamWithMembers"."id"
group by
  "TeamWithMembers"."id"
order by
  "TeamWithMembers"."name" asc
