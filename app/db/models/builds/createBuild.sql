insert into
  "Build" (
    "ownerId",
    "title",
    "description",
    "modes",
    "headGearSplId",
    "clothesGearSplId",
    "shoesGearSplId"
  )
values
  (
    @ownerId,
    @title,
    @description,
    @modes,
    @headGearSplId,
    @clothesGearSplId,
    @shoesGearSplId
  ) returning *