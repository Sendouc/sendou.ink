import Database from "better-sqlite3";
import invariant from "tiny-invariant";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import type { DB } from "./tables";

declare global {
  var database: typeof sql;
}

const testDb = new Database("db-test.sqlite3").serialize();

invariant(process.env["DB_PATH"], "DB_PATH env variable must be set");
export const sql = new Database(testDb);

globalThis["database"] = sql;

export const resetTestDb = () => {
  globalThis.database = new Database(testDb);
};

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: globalThis.database,
  }),
  log: process.env.NODE_ENV === "development" ? ["query"] : undefined,
  plugins: [new ParseJSONResultsPlugin()],
});
