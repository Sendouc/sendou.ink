module.exports.up = function (db) {
  db.prepare(/* sql */ `alter table "User" add "favBadgeId" integer not null default 0`).run();
};
