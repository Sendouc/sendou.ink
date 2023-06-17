module.exports.up = function (db) {
  db.prepare(/* sql */ `alter table "User" add "discordUniqueName" text`).run();
  db.prepare(
    /* sql */ `alter table "User" add "showDiscordUniqueName" integer not null default 1`
  ).run();
};
