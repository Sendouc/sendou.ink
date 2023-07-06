import { sql } from "~/db/sql";
import type { Art, User, UserSubmittedImage } from "~/db/types";

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

export interface ShowcaseArt {
  id: Art["id"];
  discordId: User["discordId"];
  discordName: User["discordName"];
  discordDiscriminator: User["discordDiscriminator"];
  discordAvatar: User["discordAvatar"];
  commissionsOpen: User["commissionsOpen"];
  url: UserSubmittedImage["url"];
}

export function showcaseArts(): ShowcaseArt[] {
  return stm.all() as any;
}
