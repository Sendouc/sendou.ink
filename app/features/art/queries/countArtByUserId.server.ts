import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  select
    count(*) as "count"
  from
    "Art"
  left join "ArtUserMetadata" on "ArtUserMetadata"."artId" = "Art"."id"
  where "Art"."authorId" = @userId
    or "ArtUserMetadata"."userId" = @userId
`);

export function countArtByUserId(userId: number) {
  return stm.pluck().get({ userId }) as number;
}
