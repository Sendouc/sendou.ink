import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("db.sqlite3");

const __dirname = path.resolve();
const migration = fs.readFileSync(
  path.resolve(__dirname, "migrations", "000-initial.sql"),
  "utf8"
);

db.exec(migration);
// eslint-disable-next-line no-console
console.log("migrated...");
