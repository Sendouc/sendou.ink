module.exports.up = function (db) {
  db.prepare(`alter table "CalendarEvent" drop column "isBeforeStart"`).run();

  db.prepare(`delete from "TournamentTeam"`).run();
  db.prepare(
    `alter table "TournamentTeam" add "inviteCode" text not null`
  ).run();
  db.prepare(`alter table "TournamentTeam" add "checkedInAt" integer`).run();

  db.prepare(
    `
    create table "TrustRelationship" (
      "trustGiverId" integer not null,
      "trustReceiverId" integer not null,
      "createdAt" integer not null,
      foreign key ("trustGiverId") references "User"("id") on delete cascade,
      foreign key ("trustReceiverId") references "User"("id") on delete cascade,
      unique("trustGiverId", "trustReceiverId") on conflict rollback
    ) strict
    `
  ).run();

  db.prepare(
    `
    create table "TournamentBracket" (
      "id" integer primary key,
      "calendarEventId" integer not null,
      "type" text not null,
      foreign key ("calendarEventId") references "CalendarEvent"("id") on delete restrict
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_bracket_calendar_event_id on "TournamentBracket"("calendarEventId")`
  ).run();

  db.prepare(
    `
    create table "TournamentRound" (
      "id" integer primary key,
      "position" integer not null,
      "bracketId" integer not null,
      "bestOf" integer not null,
      foreign key ("bracketId") references "TournamentBracket"("id") on delete cascade,
      unique("bracketId", "position") on conflict rollback
    ) strict
    `
  ).run();

  // xxx: add some unique constraint here
  db.prepare(
    `
    create table "TournamentMatch" (
      "id" integer primary key,
      "roundId" integer not null,
      "number" integer,
      "position" integer not null,
      "winnerDestinationMatchId" integer,
      "loserDestinationMatchId" integer,
      foreign key ("roundId") references "TournamentRound"("id") on delete cascade,
      foreign key ("winnerDestinationMatchId") references "TournamentMatch"("id") on delete restrict,
      foreign key ("loserDestinationMatchId") references "TournamentMatch"("id") on delete restrict
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_match_round_id on "TournamentMatch"("roundId")`
  ).run();

  db.prepare(
    `
    create table "TournamentMatchParticipant" (
      "order" text not null,
      "teamId" integer not null,
      "matchId" integer not null,
      foreign key ("teamId") references "TournamentTeam"("id") on delete restrict,
      foreign key ("matchId") references "TournamentMatch"("id") on delete restrict,
      unique("teamId", "matchId") on conflict rollback
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_match_participant_team_id on "TournamentMatchParticipant"("teamId")`
  ).run();
  db.prepare(
    `create index tournament_match_participant_match_id on "TournamentMatchParticipant"("matchId")`
  ).run();

  db.prepare(
    `
    create table "TournamentMatchGameResult" (
      "id" integer primary key,
      "matchId" integer unique not null,
      "stageId" integer not null,
      "mode" text not null,
      "winnerTeamId" integer not null,
      "reporterId" integer not null,
      "createdAt" integer not null,
      foreign key ("matchId") references "TournamentMatch"("id") on delete cascade,
      foreign key ("winnerTeamId") references "TournamentTeam"("id") on delete restrict,
      foreign key ("reporterId") references "User"("id") on delete restrict
    ) strict
    `
  ).run();
  db.prepare(
    `create index tournament_match_game_result_match_id on "TournamentMatchGameResult"("matchId")`
  ).run();
  db.prepare(
    `create index tournament_match_game_result_winner_team_id on "TournamentMatchGameResult"("winnerTeamId")`
  ).run();
};

module.exports.down = function (db) {
  db.prepare(
    `alter table "CalendarEvent" add "isBeforeStart" integer default 1`
  ).run();

  db.prepare(`alter table "TournamentTeam" drop column "inviteCode"`).run();
  db.prepare(`alter table "TournamentTeam" drop column "checkedInAt"`).run();

  db.prepare(`drop table "TrustRelationship"`).run();

  db.prepare(`drop index tournament_bracket_calendar_event_id`).run();
  db.prepare(`drop table "TournamentBracket"`).run();

  db.prepare(`drop table "TournamentRound"`).run();

  db.prepare(`drop index tournament_match_round_id`).run();
  db.prepare(`drop table "TournamentMatch"`).run();

  db.prepare(`drop index tournament_match_participant_team_id`).run();
  db.prepare(`drop index tournament_match_participant_match_id`).run();
  db.prepare(`drop table "TournamentMatchParticipant"`).run();

  db.prepare(`drop index tournament_match_game_result_match_id`).run();
  db.prepare(`drop index tournament_match_game_result_winner_team_id`).run();
  db.prepare(`drop table "TournamentMatchGameResult"`).run();
};
