import { sql } from "~/db/sql";
import type { ListedArt } from "../art-types";

const stm = sql.prepare(/* sql */ `
  select
    "Art"."id",
    "User"."discordId",
    "User"."discordName",
    "User"."discordDiscriminator",
    "User"."discordAvatar",
    "User"."commissionsOpen",
    "UserSubmittedImage"."url"
  from
    "Art"
  left join "User" on "User"."id" = "Art"."authorId"
  inner join "UserSubmittedImage" on "UserSubmittedImage"."id" = "Art"."imgId"
  where
    "Art"."isShowcase" = 1
  order by random()
`);

export function showcaseArts(): ListedArt[] {
  return stm.all().map((a: any) => ({
    id: a.id,
    url: a.url,
    author: {
      commissionsOpen: a.commissionsOpen,
      discordAvatar: a.discordAvatar,
      discordDiscriminator: a.discordDiscriminator,
      discordId: a.discordId,
      discordName: a.discordName,
    },
  }));
}
