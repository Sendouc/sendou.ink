module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "TournamentStage" add "createdAt" integer`,
  ).run();
};
