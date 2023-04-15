module.exports.up = function (db) {
  db.prepare(/* sql */ `alter table "User" add "favoriteBadgeId" integer not null default 0`).run();
};
