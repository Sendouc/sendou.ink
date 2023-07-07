update
  "User"
set
  "country" = @country,
  "bio" = @bio,
  "customUrl" = @customUrl,
  "stickSens" = @stickSens,
  "motionSens" = @motionSens,
  "inGameName" = @inGameName,
  "css" = @css,
  "favoriteBadgeId" = @favoriteBadgeId,
  "showDiscordUniqueName" = @showDiscordUniqueName,
  "commissionsOpen" = @commissionsOpen,
  "commissionText" = @commissionText
where
  "id" = @id returning *
