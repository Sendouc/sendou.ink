with "TeamWithMembers" as (
  select
    "TournamentTeam"."id",
    "TournamentTeam"."name",
    json_group_array(
      json_object(
        'userId',
        "TournamentTeamMember"."userId",
        'isOwner',
        "TournamentTeamMember"."isOwner",
        'discordName',
        "User"."discordName",
        'discordId',
        "User"."discordId",
        'discordAvatar',
        "User"."discordAvatar",
        'plusTier',
        "PlusTier"."tier"
      )
    ) as "members"
  from
    "TournamentTeam"
    left join "TournamentTeamMember" on "TournamentTeamMember"."tournamentTeamId" = "TournamentTeam"."id"
    left join "User" on "User"."id" = "TournamentTeamMember"."userId"
    left join "PlusTier" on "User"."id" = "PlusTier"."userId"
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
