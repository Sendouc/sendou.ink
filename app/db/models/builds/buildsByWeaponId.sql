with "Top500Weapon" as (
  select
    "BuildWeapon".*,
    min("XRankPlacement"."rank") as "minRank",
    max("XRankPlacement"."power") as "maxPower",
    (
      (
        "BuildWeapon"."weaponSplId" = @weaponId
        or "BuildWeapon"."weaponSplId" = @altWeaponId
      )
      and "XRankPlacement"."rank" is not null
    ) as "relevant"
  from
    "BuildWeapon"
    left join "Build" on "Build"."id" = "BuildWeapon"."buildId"
    left join "SplatoonPlayer" on "SplatoonPlayer"."userId" = "Build"."ownerId"
    left join "XRankPlacement" on "XRankPlacement"."playerId" = "SplatoonPlayer"."id"
    and "XRankPlacement"."weaponSplId" = "BuildWeapon"."weaponSplId"
  group by
    "BuildWeapon"."buildId",
    "BuildWeapon"."weaponSplId"
),
"BuildFiltered" as (
  select
    "id",
    "title",
    "description",
    "modes",
    "headGearSplId",
    "clothesGearSplId",
    "shoesGearSplId",
    "updatedAt",
    "ownerId",
    max("Top500Weapon"."relevant") as "isTop500"
  from
    "Build"
    left join "Top500Weapon" on "Top500Weapon"."buildId" = "Build"."id"
  where
    "Top500Weapon"."weaponSplId" = @weaponId
    or "Top500Weapon"."weaponSplId" = @altWeaponId
  group by
    "Build"."id"
),
"BuildWithWeapon" as (
  select
    "BuildFiltered".*,
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
    "BuildFiltered"
    left join "Top500Weapon" on "Top500Weapon"."buildId" = "BuildFiltered"."id"
  group by
    "BuildFiltered"."id"
)
select
  "BuildWithWeapon".*,
  "User"."discordId",
  "User"."discordName",
  "User"."discordDiscriminator",
  "PlusTier"."tier" as "plusTier",
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
  "BuildWithWeapon"."isTop500" desc,
  case
    when "PlusTier"."tier" is null then 4
    else "PlusTier"."tier"
  end asc,
  "BuildWithWeapon"."updatedAt" desc
limit
  @limit
