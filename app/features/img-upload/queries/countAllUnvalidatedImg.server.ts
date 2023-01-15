import { sql } from "~/db/sql";

const stm = sql.prepare(/*sql*/ `
  select count(*) as "count" from "UnvalidatedUserSubmittedImage"
    where "validatedAt" is null
`);

export function countAllUnvalidatedImg() {
  return stm.get().count as number;
}
