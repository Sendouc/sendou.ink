module.exports.up = function (db) {
  db.prepare(
    /*sql*/ `
  create table "UnvalidatedVideo" (
    "id" integer primary key,
    "youtubeId" text not null unique,
    "submitterUserId" integer not null,
    "valitedAt" integer,
    foreign key ("submitterUserId") references "User"("id") on delete restrict
  ) strict
  `
  ).run();

  db.prepare(
    /*sql*/ `
      create view "Video"
      as
      select * from "UnvalidatedVideo" where "validatedAt" is not null
  `
  ).run();

  db.prepare(
    /*sql*/ `
    create table "VideoMatch" (
      "videoId" integer not null,
      "type" text not null,
      "startsAt" integer not null,
      "stageId" integer not null,
      "mode" text not null,
      "eventId" integer,
      "eventName" text,
      "hasVc" integer not null,
      foreign key ("videoId") references "UnvalidatedVideo"("id") on delete set null,
      foreign key ("eventId") references "CalendarEvent"("id") on delete restrict
    ) strict
    `
  ).run();
  db.prepare(
    `create index video_match_video_id on "VideoMatch"("videoId")`
  ).run();
  db.prepare(
    `create index video_match_event_id on "VideoMatch"("eventId")`
  ).run();

  db.prepare(
    /*sql*/ `
    create table "VideoMatchPlayer" (
      "playerUserId" integer not null,
      "playerName" text not null,
      "weaponSplId" integer not null,
      "isPov" integer not null,
      "teamSide" integer not null,
      foreign key ("playerUserId") references "User"("id") on delete restrict
    ) strict
    `
  ).run();
  db.prepare(
    `create index video_match_player_player_user_id on "VideoMatchPlayer"("playerUserId")`
  ).run();
};
