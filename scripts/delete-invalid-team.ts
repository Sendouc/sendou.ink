/* eslint-disable no-console */
import "dotenv/config";
import { sql } from "~/db/sql";

sql.prepare(`delete from "AllTeam" where "customUrl" = ''`).run();

console.log(`Done deleting empty team`);
