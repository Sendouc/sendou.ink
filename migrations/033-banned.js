module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "User" add "banned" integer default 0`,
  ).run();
};
