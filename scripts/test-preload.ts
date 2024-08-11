import { mock } from "bun:test";

mock.module("newrelic", () => {
	return {
		default: null,
	};
});

const testDb = Bun.file("db-test.sqlite3");
await Bun.write("db-test-active.sqlite3", testDb);
