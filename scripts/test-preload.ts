const testDb = Bun.file("db-test.sqlite3");
await Bun.write("db-test-active.sqlite3", testDb);

export type {};
