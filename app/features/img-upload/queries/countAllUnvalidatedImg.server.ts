import { sql } from "~/db/sql";

const stm = sql.prepare(/*sql*/ `
  select count(*) as "count" from "UnvalidatedUserSubmittedImage"
  inner join "Team" on 
    "UnvalidatedUserSubmittedImage"."id" = "Team"."avatarImgId" or 
    "UnvalidatedUserSubmittedImage"."id" = "Team"."bannerImgId"
  where "validatedAt" is null
`);

export function countAllUnvalidatedImg() {
  return stm.get().count as number;
}
