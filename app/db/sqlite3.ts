import Database from "better-sqlite3";

// eslint-disable-next-line no-console
export const sql = new Database("db.sqlite3", { verbose: console.log });

// TODO: before merge this with import not probably correct?
sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
