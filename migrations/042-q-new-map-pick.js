module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(
      /* sql */ `alter table "Group" add "ownerPicksMaps" integer default 0`,
    ).run();
    db.prepare(
      /* sql */ `alter table "User" add "mapModePreferences" text`,
    ).run();
    db.prepare(/* sql */ `alter table "User" add "qWeaponPool" text`).run();
  })();
};
