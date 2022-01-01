import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database(path.resolve("app", "db", "test.db"));

const migration = fs.readFileSync(
  path.resolve("app", "db", "migrations", "01_initial.sql"),
  "utf8"
);

db.exec(migration);
console.log("migrated...");
db.prepare(
  "INSERT INTO stages (id, map_name, mode) VALUES(1, 'The Reef', 'RM')"
).run();
const row = db.prepare("SELECT * FROM stages LIMIT 1").get();
console.log(row);
