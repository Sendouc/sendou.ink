import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  select
    count(distinct "Art"."id") as "count"
  from
    "Art"
  left join "ArtUserMetadata" on "ArtUserMetadata"."artId" = "Art"."id"
  inner join "UserSubmittedImage" on "UserSubmittedImage"."id" = "Art"."imgId"
  where "Art"."authorId" = @userId
    or "ArtUserMetadata"."userId" = @userId
`);

export function countArtByUserId(userId: number) {
  return stm.pluck().get({ userId }) as number;
}
