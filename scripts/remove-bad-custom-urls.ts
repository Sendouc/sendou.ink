/* eslint-disable no-console */
import "dotenv/config";
import { sql } from "~/db/sql";

sql
  .prepare(`update "User" set "customUrl" = NULL where "customUrl" like '%#%'`)
  .run();

console.log("Done");
