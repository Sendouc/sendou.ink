module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "User" add "noScreen" integer default 0`,
  ).run();
};
