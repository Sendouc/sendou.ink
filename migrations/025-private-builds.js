module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "Build" add "private" integer default 0`
  ).run();
};
