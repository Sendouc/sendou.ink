select
  "CalendarEvent"."id" as "eventId",
  null as "tournamentId",
  "CalendarEventResultTeam"."placement",
  "CalendarEvent"."participantCount",
  "CalendarEvent"."name" as "eventName",
  "CalendarEventResultTeam"."id" as "teamId",
  "CalendarEventResultTeam"."name" as "teamName",
  (
    select
      max("startTime")
    from
      "CalendarEventDate"
    where
      "eventId" = "CalendarEvent"."id"
  ) as "startTime",
  exists (
    select
      1
    from
      "UserResultHighlight"
    where
      "userId" = @userId
      and "teamId" = "CalendarEventResultTeam"."id"
  ) as "isHighlight"
from
  "CalendarEventResultPlayer"
  join "CalendarEventResultTeam" on "CalendarEventResultTeam"."id" = "CalendarEventResultPlayer"."teamId"
  join "CalendarEvent" on "CalendarEvent"."id" = "CalendarEventResultTeam"."eventId"
where
  "CalendarEventResultPlayer"."userId" = @userId
union
all
select
  null as "eventId",
  "TournamentResult"."tournamentId",
  "TournamentResult"."placement",
  "TournamentResult"."participantCount",
  "CalendarEvent"."name" as "eventName",
  "TournamentTeam"."id" as "teamId",
  "TournamentTeam"."name" as "teamName",
  (
    select
      max("startTime")
    from
      "CalendarEventDate"
    where
      "eventId" = "CalendarEvent"."id"
  ) as "startTime",
  "TournamentResult"."isHighlight"
from
  "TournamentResult"
  left join "TournamentTeam" on "TournamentTeam"."id" = "TournamentResult"."tournamentTeamId"
  left join "CalendarEvent" on "CalendarEvent"."tournamentId" = "TournamentResult"."tournamentId"
where
  "TournamentResult"."userId" = @userId
order by
  "startTime" desc
