/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";

// only to be used if tournament didn't have skills etc. calculated

const id = process.argv[2]?.trim();

invariant(id, "id of tournament is required (argument 1)");

sql
  .prepare(
    `delete from "TournamentResult" where "TournamentResult"."tournamentId" = @id`,
  )
  .run({ id });

console.log(`Reopened tournament with id ${id}`);
