select
  "User".*,
  "Team"."name" as "teamName",
  "Team"."customUrl" as "teamCustomUrl",
  "UserSubmittedImage"."url" as "teamAvatarUrl",
  "PlusTier"."tier" as "plusTier",
  json_group_array("UserWeapon"."weaponSplId") as "weapons"
from
  "User"
  left join "PlusTier" on "PlusTier"."userId" = "User"."id"
  left join "UserWeapon" on "UserWeapon"."userId" = "User"."id"
  left join "TeamMember" on "TeamMember"."userId" = "User"."id"
  left join "Team" on "Team"."id" = "TeamMember"."teamId"
  left join "UserSubmittedImage" on "Team"."avatarImgId" = "UserSubmittedImage"."id"
  and "UserSubmittedImage"."validatedAt" is not null
where
  "User"."discordId" = @identifier
  or "User"."id" = @identifier
  or "User"."customUrl" = @identifier
order by
  "UserWeapon"."order" asc
