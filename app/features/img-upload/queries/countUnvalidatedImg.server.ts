import { sql } from "~/db/sql";

const stm = sql.prepare(/*sql*/ `
  select count(*) as "count" from "UnvalidatedUserSubmittedImage"
    where "validatedAt" is null
      and "submitterUserId" = @userId
`);

export function countUnvalidatedImg(userId: number) {
  return stm.get({ userId }).count as number;
}
