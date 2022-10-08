/* eslint-disable no-console */
import "dotenv/config";
import { sql } from "~/db/sql";

sql.prepare(
  `update "User" set "customUrl" = NULL where "customUrl" like '%/%'`
);

console.log("Done");
