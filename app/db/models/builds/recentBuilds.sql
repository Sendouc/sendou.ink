with "RecentBuild" as (
  select
    *
  from
    "Build"
  order by
    "updatedAt" desc
  limit
    3
), "BuildFiltered" as (
  select
    "id",
    "title",
    "description",
    "modes",
    "headGearSplId",
    "clothesGearSplId",
    "shoesGearSplId",
    "updatedAt",
    "ownerId"
  from
    "RecentBuild"
    left join "BuildWeapon" on "BuildWeapon"."buildId" = "RecentBuild"."id"
  group by
    "RecentBuild"."id"
),
"BuildWithWeapon" as (
  select
    "BuildFiltered".*,
    json_group_array("BuildWeapon"."weaponSplId") as "weapons"
  from
    "BuildFiltered"
    left join "BuildWeapon" on "BuildWeapon"."buildId" = "BuildFiltered"."id"
  group by
    "BuildFiltered"."id"
)
select
  "BuildWithWeapon".*,
  "User"."discordId",
  "User"."discordName",
  "User"."discordDiscriminator",
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
  left join "PlusTier" on "PlusTier"."userId" = "BuildWithWeapon"."ownerId"
  left join "User" on "User"."id" = "BuildWithWeapon"."ownerId"
group by
  "BuildWithWeapon"."id"
