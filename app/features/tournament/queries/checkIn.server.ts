import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "TournamentTeam"
  set "checkedInAt" = strftime('%s', 'now')
  where "id" = @id
`);

export function checkIn(id: number) {
  stm.run({ id });
}
