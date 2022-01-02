import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("db.sqlite3");

const migration = fs.readFileSync(
  path.resolve("app", "db", "migrations", "01_initial.sql"),
  "utf8"
);

db.exec(migration);
console.log("migrated...");
