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
  "favoriteBadgeId" = @favoriteBadgeId
where
  "id" = @id returning *
