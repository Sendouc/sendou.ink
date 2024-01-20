module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "Tournament" add "settings" text not null default '{"bracketProgression":[{"type":"double_elimination","name":"Main bracket"}]}'`,
  ).run();

  db.prepare(
    /* sql */ `alter table "TournamentTeamCheckIn" add "bracketIdx" integer`,
  ).run();

  db.prepare(/* sql */ `alter table "Tournament" drop column "format"`).run();
};
