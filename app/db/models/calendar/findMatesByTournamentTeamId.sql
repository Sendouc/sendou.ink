select
  "User"."id",
  "User"."discordName",
  "User"."discordDiscriminator",
  "User"."discordId",
  "User"."discordAvatar"
from
  "TournamentTeamMember"
  left join "User" on "User"."id" = "TournamentTeamMember"."userId"
where
  "TournamentTeamMember"."tournamentTeamId" = @teamId
  and "TournamentTeamMember"."userId" != @userId
