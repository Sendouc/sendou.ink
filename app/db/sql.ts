import { Database } from "bun:sqlite";
import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import invariant from "~/utils/invariant";
import type { DB } from "./tables";

// xxx: TODO migratedEmptyDb, unit tests
// const migratedEmptyDb = new Database("db-test.sqlite3").serialize();

invariant(process.env.DB_PATH, "DB_PATH env variable must be set");
// const isInMemoryDB = process.env.DB_PATH === ":memory:";

export const sql = new Database(process.env.DB_PATH, {
	strict: true,
});

sql.exec("PRAGMA journal_mode = WAL");
sql.exec("PRAGMA foreign_keys = ON");
sql.exec("PRAGMA busy_timeout = 5000");

export const db = new Kysely<DB>({
	dialect: new BunSqliteDialect({
		database: sql,
	}),
	// uncomment if you want examine the queries
	// log: process.env.NODE_ENV === "development" ? ["query"] : undefined,
	// log(event): void {
	//   if (event.level === "query") {
	//     console.log(event.query.sql);
	//     console.log(event.query.parameters);
	//   }
	// },
	plugins: [new ParseJSONResultsPlugin()],
});
