module.exports.up = function (db) {
  db.prepare(
    `
    create table "CalendarEvent" (
      "id" integer primary key,
      "name" text not null,
      "authorId" integer not null,
      "bracketUrl" text not null,
      "description" text,
      "discordUrl" text,
      "participantCount" integer,
      "tags" text,
      foreign key ("authorId") references "User"("id") on delete restrict
    ) strict
    `
  ).run();

  db.prepare(
    ` 
    create table "CalendarEventDate" (
      "id" integer primary key,
      "eventId" integer not null,
      "startTime" integer not null,
      foreign key ("eventId") references "CalendarEvent"("id") on delete cascade
    ) strict
    `
  ).run();

  db.prepare(
    `
    create table "CalendarEventWinner" (
      "eventId" integer not null,
      "teamName" text not null,
      "placement" integer not null,
      "userId" integer,
      "name" text,
      foreign key ("eventId") references "CalendarEvent"("id") on delete cascade,
      foreign key ("userId") references "User"("id") on delete cascade
    ) strict
    `
  ).run();

  db.prepare(
    `
    create table "CalendarEventBadge" (
      "eventId" integer not null,
      "badgeId" integer not null,
      foreign key ("eventId") references "CalendarEvent"("id") on delete cascade,
      foreign key ("badgeId") references "Badge"("id") on delete restrict,
      unique("eventId", "badgeId") on conflict rollback
    ) strict
    `
  ).run();
};

module.exports.down = function (db) {
  for (const table of [
    "CalendarEventDate",
    "CalendarEventWinner",
    "CalendarEventBadge",
    "CalendarEvent",
  ]) {
    db.prepare(`drop table "${table}"`).run();
  }
};
