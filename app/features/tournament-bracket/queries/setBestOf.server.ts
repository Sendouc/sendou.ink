import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update TournamentMatch
    set bestOf = @bestOf
    where id = @id
`);

export function setBestOf({ id, bestOf }: { id: number; bestOf: 3 | 5 | 7 }) {
  stm.run({ id, bestOf });
}
