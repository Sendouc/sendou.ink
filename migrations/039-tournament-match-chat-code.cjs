module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(
      /* sql */ `alter table "TournamentMatch" add "chatCode" text`,
    ).run();
  })();
};
