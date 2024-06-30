export function up(db) {
	db.transaction(() => {
		db.prepare(/* sql */ `alter table "Tournament" add "series" text`).run();
		db.prepare(
			/*sql*/ `create index tournament_series on "Tournament"("series")`,
		).run();
	})();
}
