import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "TournamentTeam"
  set "checkedInAt" = null
  where "id" = @tournamentTeamId
`);

export function checkOut(tournamentTeamId: number) {
  stm.run({ tournamentTeamId });
}
