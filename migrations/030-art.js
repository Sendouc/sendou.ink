module.exports.up = function (db) {
  db.prepare(
    /* sql */ `alter table "User" add "commissionsOpen" integer default 0`
  ).run();
  db.prepare(/* sql */ `alter table "User" add "commissionText" text`).run();

  db.prepare(
    /*sql*/ `
    create table "Art" (
      "id" integer primary key,
      "imgId" integer not null,
      "authorId" integer not null,
      "isShowcase" integer not null default 0,
      "title" text,
      "description" text,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      foreign key ("authorId") references "User"("id") on delete set null,
      foreign key ("imgId") references "UnvalidatedUserSubmittedImage"("id") on delete cascade
    ) strict
  `
  ).run();

  db.prepare(`create index art_author_id on "Art"("authorId")`).run();
  db.prepare(`create index art_img_id on "Art"("imgId")`).run();

  db.prepare(
    /*sql*/ `
    create table "ArtUserMetadata" (
      "artId" integer not null,
      "userId" integer not null,
      foreign key ("artId") references "Art"("id") on delete set null,
      foreign key ("userId") references "User"("id") on delete cascade
    ) strict
  `
  ).run();

  db.prepare(
    `create index art_user_metadata_art_id on "ArtUserMetadata"("artId")`
  ).run();
  db.prepare(
    `create index art_user_metadata_user_id on "ArtUserMetadata"("userId")`
  ).run();
};
