module.exports.up = function (db) {
  db.prepare(
    /*sql*/ `
  create table "SplatoonPlacement" (
    "id" integer primary key,
    "weaponSplId" integer not null,
    "name" text not null,
    "nameDiscriminator" text not null,
    "power" real not null,
    "rank" integer not null,
    "title" text not null,
    "badges" text not null,
    "bannerSplId" integer not null,
    "playerId" integer not null,
    "month" integer not null,
    "year" integer not null,
    "mode" text not null,
    "type" text not null,
    "region" text not null,
    foreign key ("playerId") references "SplatoonPlayer"("id") on delete cascade,
    unique("rank", "month", "year", "type", "region", "team") on conflict rollback
  ) strict
  `
  ).run();

  db.prepare(
    `create index splatoon_placement_player_id on "SplatoonPlacement"("playerId")`
  ).run();

  db.prepare(
    /*sql*/ `
  create table "SplatoonPlayer" (
    "id" integer primary key,
    "userId" integer unique,
    "splId" text unique not null,
    foreign key ("userId") references "User"("id") on delete cascade
  ) strict
  `
  ).run();

  db.prepare(
    `create index splatoon_player_user_id on "SplatoonPlayer"("userId")`
  ).run();
};
