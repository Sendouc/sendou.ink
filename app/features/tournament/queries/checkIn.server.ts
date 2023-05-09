import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "TournamentTeam"
  set "checkedInAt" = strftime('%s', 'now')
  where "id" = @tournamentTeamId
`);

export function checkIn(tournamentTeamId: number) {
  stm.run({ tournamentTeamId });
}
