module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "Tournament" add "bracketsStyle" text not null default '[{"format":"DE"}]'`,
  ).run();

  db.prepare(/* sql */ `alter table "Tournament" drop column "format"`).run();
};
