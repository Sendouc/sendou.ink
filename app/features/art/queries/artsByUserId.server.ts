import { sql } from "~/db/sql";
import type { ListedArt } from "../art-types";

const stm = sql.prepare(/* sql */ `
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
`);

export function artsByUserId(userId: number): ListedArt[] {
  return stm.all({ userId }).map((a: any) => ({
    id: a.id,
    url: a.url,
    description: a.description,
    author: a.discordId
      ? {
          commissionsOpen: a.commissionsOpen,
          discordAvatar: a.discordAvatar,
          discordDiscriminator: a.discordDiscriminator,
          discordId: a.discordId,
          discordName: a.discordName,
        }
      : undefined,
  }));
}
