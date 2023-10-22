import Database from "better-sqlite3";
import invariant from "tiny-invariant";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "kysely-codegen";

invariant(process.env["DB_PATH"], "DB_PATH env variable must be set");
export const sql = new Database(process.env["DB_PATH"]);

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");

// xxx: rename
// xxx: probably this should not come directly from kysely-codegen but from our own file?
export const dbNew = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sql,
  }),
});
