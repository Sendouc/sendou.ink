import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  select
    count (*) as "count"
  from "TournamentSub"
  where "tournamentId" = @tournamentId
`);

export function subsCount(tournamentId: number) {
  return stm.pluck().get({ tournamentId }) as number;
}
