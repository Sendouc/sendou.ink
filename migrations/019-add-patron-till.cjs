module.exports.up = function (db) {
  db.prepare(/* sql */ `alter table "User" add "patronTill" integer`).run();
};
