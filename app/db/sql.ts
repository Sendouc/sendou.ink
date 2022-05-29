import Database from "better-sqlite3";

export const sql = new Database(
  process.env.NODE_ENV === "test" ? "db-cypress.sqlite3" : "db.sqlite3"
);

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");
