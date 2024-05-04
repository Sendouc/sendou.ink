export function up(db) {
  db.transaction(() => {
    db.prepare(
      /*sql*/ `
      create table "LFGPost" (
        "id" integer primary key,
        "type" text not null,
        "text" text not null,
        "timezone" text not null,
        "authorId" integer not null,
        "teamId" integer,
        "updatedAt" integer default (strftime('%s', 'now')) not null,
        "createdAt" integer default (strftime('%s', 'now')) not null,
        foreign key ("authorId") references "User"("id") on delete restrict,
        foreign key ("teamId") references "Team"("id") on delete cascade
      ) strict
    `,
    ).run();

    db.prepare(
      /*sql*/ `
      create table "LFGPostMate" (
        "postId" integer not null,
        "userId" integer not null,
        foreign key ("postId") references "LFGPost"("id") on delete cascade,
        foreign key ("userId") references "User"("id") on delete restrict
      ) strict
    `,
    ).run();
  })();
}
