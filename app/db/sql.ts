import { Database } from "bun:sqlite";
import { styleText } from "node:util";
import { Kysely, type LogEvent, ParseJSONResultsPlugin } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { format } from "sql-formatter";
import invariant from "~/utils/invariant";
import { roundToNDecimalPlaces } from "~/utils/number";
import type { DB } from "./tables";

const LOG_LEVEL = (["trunc", "full", "none"] as const).find(
	(val) => val === process.env.SQL_LOG,
);

invariant(process.env.DB_PATH, "DB_PATH env variable must be set");

export const sql = new Database(process.env.DB_PATH, {
	strict: true,
});

sql.exec("PRAGMA journal_mode = WAL;");
sql.exec("PRAGMA foreign_keys = ON;");
sql.exec("PRAGMA busy_timeout = 5000;");

export const db = new Kysely<DB>({
	dialect: new BunSqliteDialect({
		database: sql,
	}),
	log: LOG_LEVEL === "trunc" || LOG_LEVEL === "full" ? logQuery : undefined,
	plugins: [new ParseJSONResultsPlugin()],
});

function logQuery(event: LogEvent) {
	const isSelectQuery = Boolean((event.query.query as any).from?.froms);

	if (event.level === "query" && isSelectQuery) {
		const from = () =>
			(event.query.query as any).from.froms.map(
				(f: any) => f.table.identifier.name,
			);
		// biome-ignore lint/suspicious/noConsoleLog: dev only
		console.log(styleText("blue", `-- SQLITE QUERY to "${from()}" --`));
		// biome-ignore lint/suspicious/noConsoleLog: dev only
		console.log(
			styleText(
				millisToColor(event.queryDurationMillis),
				`${roundToNDecimalPlaces(event.queryDurationMillis, 1)}ms`,
			),
		);
		// biome-ignore lint/suspicious/noConsoleLog: dev only
		console.log(formatSql(event.query.sql, event.query.parameters));
	}
}

function millisToColor(millis: number) {
	if (millis < 1) {
		return "bgGreen";
	}
	if (millis < 5) {
		return "green";
	}
	if (millis < 50) {
		return "yellow";
	}
	return "red";
}

function formatSql(sql: string, params: readonly unknown[]) {
	const formatted = format(sql);

	const lines = formatted.split("\n");

	if (LOG_LEVEL === "full" || lines.length <= 11) {
		return addParams(formatted, params);
	}

	const linesNotShown = lines.length - 10;

	return `${lines.slice(0, 10).join("\n")}\n... (${linesNotShown} more lines) ...\n`;
}

function addParams(sql: string, params: readonly unknown[]) {
	const coloredParams = params.map((param) =>
		styleText("yellow", JSON.stringify(param)),
	);

	return sql.replace(/\?/g, () => coloredParams.shift() || "");
}
