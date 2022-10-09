select
  "MapPool"."id",
  "MapPool"."code",
  "MapPool"."ownerId",
  "User"."discordName",
  "User"."discordDiscriminator",
  json_group_array(
    json_object(
      'stageId',
      "MapPoolMap"."stageId",
      'mode',
      "MapPoolMap"."mode"
    )
  ) as "maps"
from
  "MapPool"
  left join "MapPoolMap" on "MapPoolMap"."mapPoolId" = "MapPool"."id"
  left join "User" on "User"."id" = "MapPool"."ownerId"
where
  code = lower(@code)
group by
  "MapPool"."id"
