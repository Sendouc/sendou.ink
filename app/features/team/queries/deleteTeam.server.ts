import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "AllTeam"
  set "deletedAt" = strftime('%s', 'now')
  where "id" = @id
`);

export function deleteTeam(id: number) {
  stm.run({ id });
}
