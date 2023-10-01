module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(/* sql */ `alter table "GroupMatch" add "memento" text`).run();
  })();
};
