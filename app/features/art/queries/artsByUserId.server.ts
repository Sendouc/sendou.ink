import { sql } from "~/db/sql";
import type { ListedArt } from "../art-types";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  with "q1" as (
    select
      "Art"."id",
      "Art"."description",
      "Art"."createdAt",
      "User"."discordId",
      "User"."discordName",
      "User"."discordDiscriminator",
      "User"."discordAvatar",
      "UserSubmittedImage"."url"
    from
      "Art"
    left join "User" on "User"."id" = "Art"."authorId"
    left join "ArtUserMetadata" on "ArtUserMetadata"."artId" = "Art"."id"
    inner join "UserSubmittedImage" on "UserSubmittedImage"."id" = "Art"."imgId"
    where "ArtUserMetadata"."userId" = @userId
      and "Art"."authorId" != @userId

    union all

    select
      "Art"."id",
      "Art"."description",
      "Art"."createdAt",
      null, -- discordId
      null, -- discordName
      null, -- discordDiscriminator
      null, -- discordAvatar
      "UserSubmittedImage"."url"
    from
      "Art"
    inner join "UserSubmittedImage" on "UserSubmittedImage"."id" = "Art"."imgId"
    where
      "Art"."authorId" = @userId

    order by "Art"."createdAt" desc
  )
  select
    "q1".*,
    json_group_array("ArtTag"."name") as "tags"
  from
    "q1"
  left join "TaggedArt" on "TaggedArt"."artId" = "q1"."id"
  left join "ArtTag" on "ArtTag"."id" = "TaggedArt"."tagId"
  group by "q1"."id"
`);

export function artsByUserId(userId: number): ListedArt[] {
  return stm.all({ userId }).map((a: any) => {
    const tags = parseDBArray(a.tags) as any[];

    return {
      id: a.id,
      url: a.url,
      description: a.description,
      tags: tags.length > 0 ? tags : undefined,
      author: a.discordId
        ? {
            commissionsOpen: a.commissionsOpen,
            discordAvatar: a.discordAvatar,
            discordDiscriminator: a.discordDiscriminator,
            discordId: a.discordId,
            discordName: a.discordName,
          }
        : undefined,
    };
  });
}
