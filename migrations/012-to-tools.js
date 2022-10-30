module.exports.up = function (db) {
  db.prepare(`alter table "CalendarEvent" add "customUrl" text`).run();
  db.prepare(
    `create unique index calendar_event_custom_url_unique on "CalendarEvent"("customUrl")`
  ).run();

  // TODO: these should be FK's
  db.prepare(`alter table "MapPoolMap" add "tournamentTeamId" integer`).run();
  db.prepare(`alter table "MapPoolMap" add "tournamentId" integer`).run();
  db.prepare(
    `create index map_pool_map_tournament_team_id on "MapPoolMap"("tournamentTeamId")`
  ).run();
  db.prepare(
    `create index map_pool_map_tournament_id on "MapPoolMap"("tournamentId")`
  ).run();

  db.prepare(
    `
    create table "Tournament" (
      "id" integer primary key,
      "calendarEventId" integer unique not null,
      "ownerId" integer not null,
      foreign key ("calendarEventId") references "CalendarEvent"("id") on delete cascade,
      foreign key ("ownerId") references "User"("id") on delete restrict
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_owner_id on "Tournament"("ownerId")`
  ).run();

  db.prepare(
    `
    create table "TournamentTeam" (
      "id" integer primary key,
      "name" text not null,
      "createdAt" integer not null,
      "seed" integer,
      "tournamentId" integer not null,
      foreign key ("tournamentId") references "Tournament"("id") on delete cascade,
      unique("tournamentId", "name") on conflict rollback
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_team_tournament_id on "TournamentTeam"("tournamentId")`
  ).run();

  db.prepare(
    `
    create table "TournamentTeamMember" (
      "tournamentTeamId" integer not null,
      "userId" integer not null,
      "isOwner" integer not null,
      "createdAt" integer not null,
      foreign key ("tournamentTeamId") references "TournamentTeam"("id") on delete cascade
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_team_member_tournament_team_id on "TournamentTeamMember"("tournamentTeamId")`
  ).run();
};

module.exports.down = function (db) {
  db.prepare(`drop index calendar_event_custom_url_unique`).run();
  db.prepare(`drop index map_pool_map_tournament_team_id`).run();
  db.prepare(`drop index map_pool_map_tournament_id`).run();

  db.prepare(`alter table "CalendarEvent" drop column "customUrl"`).run();
  db.prepare(`alter table "MapPoolMap" drop column "tournamentTeamId"`).run();
  db.prepare(`alter table "MapPoolMap" drop column "tournamentId"`).run();

  db.prepare(`drop index tournament_owner_id`).run();
  db.prepare(`drop index tournament_team_tournament_id`).run();
  db.prepare(`drop index tournament_team_member_tournament_team_id`).run();

  db.prepare(`drop table "Tournament"`).run();
  db.prepare(`drop table "TournamentTeam"`).run();
  db.prepare(`drop table "TournamentTeamMember"`).run();
};
