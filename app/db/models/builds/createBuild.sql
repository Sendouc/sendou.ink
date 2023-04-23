insert into
  "Build" (
    "ownerId",
    "title",
    "description",
    "modes",
    "headGearSplId",
    "clothesGearSplId",
    "shoesGearSplId",
    "private"
  )
values
  (
    @ownerId,
    @title,
    @description,
    @modes,
    @headGearSplId,
    @clothesGearSplId,
    @shoesGearSplId,
    @private
  ) returning *
