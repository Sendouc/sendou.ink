module.exports.up = function (db) {
  db.prepare(
    /*sql*/ `
    create table "TournamentStaff" (
      "tournamentId" integer not null,
      "userId" integer not null,
      "role" text not null,
      foreign key ("tournamentId") references "Tournament"("id") on delete cascade,
      foreign key ("userId") references "User"("id") on delete cascade
    ) strict
  `,
  ).run();

  db.prepare(
    /* sql */ `create index tournament_staff_tournament_id on "TournamentStaff"("tournamentId")`,
  ).run();
  db.prepare(
    /* sql */ `create index tournament_staff_user_id on "TournamentStaff"("userId")`,
  ).run();
};
