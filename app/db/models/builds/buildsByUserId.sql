with "BuildWithWeapon" as (
  select
    "id",
    "title",
    "description",
    "modes",
    "headGearSplId",
    "clothesGearSplId",
    "shoesGearSplId",
    "updatedAt",
    json_group_array("BuildWeapon"."weaponSplId") as "weapons"
  from
    "Build"
    left join "BuildWeapon" on "BuildWeapon"."buildId" = "Build"."id"
  where
    "Build"."ownerId" = @userId
  group by
    "Build"."id"
)
select
  "BuildWithWeapon".*,
  json_group_array(
    json_object(
      'ability',
      "BuildAbility"."ability",
      'gearType',
      "BuildAbility"."gearType",
      'slotIndex',
      "BuildAbility"."slotIndex"
    )
  ) as "abilities"
from
  "BuildWithWeapon"
  left join "BuildAbility" on "BuildAbility"."buildId" = "BuildWithWeapon"."id"
group by
  "BuildWithWeapon"."id";