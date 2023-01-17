import { sql } from "~/db/sql";
import type { UserSubmittedImage } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "UnvalidatedUserSubmittedImage"."id",
    "UnvalidatedUserSubmittedImage"."url",
    "UnvalidatedUserSubmittedImage"."submitterUserId"
  from "UnvalidatedUserSubmittedImage"
  inner join "Team" on 
    "UnvalidatedUserSubmittedImage"."id" = "Team"."avatarImgId" or 
    "UnvalidatedUserSubmittedImage"."id" = "Team"."bannerImgId"
  where "UnvalidatedUserSubmittedImage"."validatedAt" is null
  limit 1
`);

type UnvalidatedImage = Pick<
  UserSubmittedImage,
  "id" | "url" | "submitterUserId"
>;

export function oneUnvalidatedImage(): UnvalidatedImage | null {
  return stm.get();
}
