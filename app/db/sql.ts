import Database from "better-sqlite3";
import invariant from "tiny-invariant";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import type { DB } from "./tables";

invariant(process.env["DB_PATH"], "DB_PATH env variable must be set");
export const sql = new Database(process.env["DB_PATH"]);

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");

// xxx: rename
export const dbNew = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sql,
  }),
  // xxx: chalk, but not for prod?
  log: ["query"],
  plugins: [new ParseJSONResultsPlugin()],
});
