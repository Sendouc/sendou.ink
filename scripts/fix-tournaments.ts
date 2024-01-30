/* eslint-disable no-console */
import "dotenv/config";
import { sql } from "~/db/sql";

sql
  .prepare(
    `update "TournamentStage" set "name" = 'Main bracket' where "name" = 'Elimination stage'`,
  )
  .run();

console.log(`Fixed tournaments`);
