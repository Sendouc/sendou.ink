module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(
      /* sql */ `alter table "Group" add "ownerPicksMaps" integer default 0`,
    ).run();
    db.prepare(
      /* sql */ `alter table "User" add "mapModePreferences" text`,
    ).run();
    db.prepare(/* sql */ `alter table "User" add "qWeaponPool" text`).run();

    db.prepare(`alter table "Group" drop column "mapListPreference"`).run();

    db.prepare(`drop index map_pool_map_group_id`).run();
    db.prepare(`delete from "MapPoolMap" where "groupId" is not null`).run();
    db.prepare(`alter table "MapPoolMap" drop column "groupId"`).run();

    db.prepare(
      /*sql*/ `
      create table "UserNote" (
        "authorId" integer not null,
        "targetId" integer not null,
        "text" text,
        "sentiment" text not null,
        foreign key ("authorId") references "User"("id") on delete cascade,
        foreign key ("targetId") references "User"("id") on delete cascade
      ) strict
    `,
    ).run();

    db.prepare(
      /* sql */ `create index user_note_author_id_target_id on "UserNote"("authorId", "targetId")`,
    ).run();
  })();
};
