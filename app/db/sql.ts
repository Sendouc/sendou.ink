import Database from "better-sqlite3";

export const sql = new Database("db.sqlite3");

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");
