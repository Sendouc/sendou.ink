module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(
      /* sql */ `alter table "TournamentStage" add "createdAt" integer`,
    ).run();

    db.prepare(
      /* sql */ `alter table "Tournament" add "castedMatchesInfo" text`,
    ).run();
  })();
};
