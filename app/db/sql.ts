import Database from "better-sqlite3";
import invariant from "tiny-invariant";

invariant(process.env["DB_PATH"], "DB_PATH env variable must be set");
export const sql = new Database(process.env["DB_PATH"]);

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");
