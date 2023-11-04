import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  delete from "TournamentMatchGameResult"
  where "TournamentMatchGameResult"."id" = @id
`);

export function deleteTournamentMatchGameResultById(id: number) {
  stm.run({ id });
}
