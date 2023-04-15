module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "CalendarEvent" add "isBeforeStart" integer default 1`
  ).run();

  db.prepare(
    /* sql */ `alter table "TournamentTeam" drop column "friendCode"`
  ).run();
};
