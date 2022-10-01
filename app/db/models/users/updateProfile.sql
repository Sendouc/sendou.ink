update
  "User"
set
  "country" = @country,
  "bio" = @bio,
  "customUrl" = @customUrl,
  "stickSens" = @stickSens,
  "motionSens" = @motionSens,
  "inGameName" = @inGameName
where
  "id" = @id returning *
