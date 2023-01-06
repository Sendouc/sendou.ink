module.exports.up = function (db) {
  db.prepare(
    /*sql*/ `
    create table "UserSubmittedImage" (
      "id" integer primary key,
      "validatedAt" integer,
      "url" text not null unique
    ) strict
    `
  ).run();

  db.prepare(
    /*sql*/ `
    create table "Team" (
      "id" integer primary key,
      "name" text not null,
      "customUrl" text not null,
      "inviteCode" text not null,
      "bio" text,
      "twitter" text,
      "avatarImgId" integer,
      "bannerImgId" integer,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      "deletedAt" integer,
      foreign key ("avatarImgId") references "UserSubmittedImage"("id") on delete set null,
      foreign key ("bannerImgId") references "UserSubmittedImage"("id") on delete set null
    ) strict
    `
  ).run();
  db.prepare(`create index team_custom_url on "Team"("customUrl")`).run();

  db.prepare(
    /*sql*/ `
    create table "TeamMember" (
      "teamId" integer not null,
      "userId" integer not null,
      "role" text,
      "isOwner" integer not null default 0,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      "leftAt" integer,
      foreign key ("teamId") references "Team"("id") on delete cascade,
      foreign key ("userId") references "User"("id") on delete cascade,
      unique("teamId", "userId") on conflict rollback
    ) strict
    `
  ).run();
};
