import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update
    "Tournament"
  set
    "showMapListGenerator" = @showMapListGenerator
  where
    "id" = @tournamentId;
`);

export function updateShowMapListGenerator({
  tournamentId,
  showMapListGenerator,
}: {
  tournamentId: number;
  showMapListGenerator: number;
}) {
  stm.run({ tournamentId, showMapListGenerator });
}
