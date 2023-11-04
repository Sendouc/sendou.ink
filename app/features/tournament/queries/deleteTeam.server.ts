import { sql } from "~/db/sql.server";

const stm = sql.prepare(/*sql*/ `
  delete from "TournamentTeam"
    where "id" = @tournamentTeamId
`);

export function deleteTeam(tournamentTeamId: number) {
  stm.run({ tournamentTeamId });
}
