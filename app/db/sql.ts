import Database from "better-sqlite3";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import invariant from "~/utils/invariant";
import type { DB } from "./tables";

const migratedEmptyDb = new Database("db-test.sqlite3").serialize();

invariant(process.env.DB_PATH, "DB_PATH env variable must be set");
const isInMemoryDB = process.env.DB_PATH === ":memory:";

export const sql = new Database(
	isInMemoryDB ? migratedEmptyDb : process.env.DB_PATH,
);

sql.pragma("journal_mode = WAL");
sql.pragma("foreign_keys = ON");
sql.pragma("busy_timeout = 5000");

export const db = new Kysely<DB>({
	dialect: new SqliteDialect({
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
