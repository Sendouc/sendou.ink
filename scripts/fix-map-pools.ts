/* eslint-disable no-console */
import "dotenv/config";
import { sql } from "~/db/sql";

const faultyTournamentTeamIds = sql
  .prepare(
    "select tournamentTeamId from mappoolmap where tournamentteamid is not null and mode = 'SZ' group by tournamentteamid"
  )
  .all()
  .map((row) => row.tournamentTeamId);

for (const id of faultyTournamentTeamIds) {
  sql.prepare("delete from mappoolmap where tournamentteamid = ?").run(id);
}

console.log(`Nuked the following: ${faultyTournamentTeamIds.join(", ")}`);
