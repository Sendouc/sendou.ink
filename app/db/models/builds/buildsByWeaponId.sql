with "BuildFiltered" as (
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
    "Build"
    left join "BuildWeapon" on "BuildWeapon"."buildId" = "Build"."id"
  where
    "BuildWeapon"."weaponSplId" = @weaponId
    or "BuildWeapon"."weaponSplId" = @altWeaponId
  group by
    "Build"."id"
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
order by
  case
    when "PlusTier"."tier" is null then 4
    else "PlusTier"."tier"
  end asc,
  "BuildWithWeapon"."updatedAt" desc
