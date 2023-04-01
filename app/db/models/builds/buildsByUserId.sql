with "Top500Weapon" as (
  select
    "BuildWeapon".*,
    min("SplatoonPlacement"."rank") as "minRank",
    max("SplatoonPlacement"."power") as "maxPower"
  from
    "BuildWeapon"
    left join "SplatoonPlayer" on "SplatoonPlayer"."userId" = @userId
    left join "SplatoonPlacement" on "SplatoonPlacement"."playerId" = "SplatoonPlayer"."id"
    and "SplatoonPlacement"."mode" != 'TW'
    and "SplatoonPlacement"."rank" <= 500
    and "SplatoonPlacement"."weaponSplId" = "BuildWeapon"."weaponSplId"
  group by
    "BuildWeapon"."buildId",
    "BuildWeapon"."weaponSplId"
),
"BuildWithWeapon" as (
  select
    "id",
    "title",
    "description",
    "modes",
    "headGearSplId",
    "clothesGearSplId",
    "shoesGearSplId",
    "updatedAt",
    json_group_array(
      json_object(
        'weaponSplId',
        "Top500Weapon"."weaponSplId",
        'maxPower',
        "Top500Weapon"."maxPower",
        'minRank',
        "Top500Weapon"."minRank"
      )
    ) as "weapons"
  from
    "Build"
    left join "Top500Weapon" on "Top500Weapon"."buildId" = "Build"."id"
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
  "BuildWithWeapon"."id"
order by
  "BuildWithWeapon"."updatedAt" desc
