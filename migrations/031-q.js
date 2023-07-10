module.exports.up = function (db) {
  db.prepare(
    /*sql*/ `
    create table "Group" (
      "id" integer primary key,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      "latestActionAt" integer default (strftime('%s', 'now')) not null,
      "mapListPreference" text not null,
      "isRanked" integer not null,
      "inviteCode" text not null,
      "status" text not null
    ) strict
  `
  ).run();

  db.prepare(
    /*sql*/ `
    create table "GroupMember" (
      "groupId" integer not null,
      "userId" integer not null,
      "role" text not null,
      "bestWeapons" text,
      "okWeapons" text,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      foreign key ("userId") references "User"("id") on delete restrict,
      foreign key ("groupId") references "Group"("id") on delete cascade,
      unique("userId", "groupId") on conflict rollback
    ) strict
  `
  ).run();

  db.prepare(
    `create index group_member_group_id on "GroupMember"("groupId")`
  ).run();
  db.prepare(
    `create index group_member_user_id on "GroupMember"("userId")`
  ).run();

  db.prepare(
    /*sql*/ `
    create table "GroupLike" (
      "likerGroupId" integer not null,
      "likedGroupId" integer not null,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      foreign key ("likerGroupId") references "Group"("id") on delete cascade,
      foreign key ("likedGroupId") references "Group"("id") on delete cascade,
      unique("likerGroupId", "likedGroupId") on conflict rollback
    ) strict
  `
  ).run();

  db.prepare(
    `create index group_like_liker_group_id on "GroupLike"("likerGroupId")`
  ).run();
  db.prepare(
    `create index group_like_liked_group_id on "GroupLike"("likedGroupId")`
  ).run();

  db.prepare(
    /*sql*/ `
    create table "GroupMatch" (
      "id" integer primary key,
      "alphaGroupId" integer not null,
      "bravoGroupId" integer not null,
      "createdAt" integer default (strftime('%s', 'now')) not null,
      "repotedAt" integer,
      "reportedByUserId" integer,
      foreign key ("alphaGroupId") references "Group"("id") on delete restrict,
      foreign key ("bravoGroupId") references "Group"("id") on delete restrict,
      foreign key ("reportedByUserId") references "User"("id") on delete restrict,
      unique("alphaGroupId") on conflict rollback,
      unique("bravoGroupId") on conflict rollback
    ) strict
  `
  ).run();

  db.prepare(
    `create index group_match_alpha_group_id on "GroupMatch"("alphaGroupId")`
  ).run();
  db.prepare(
    `create index group_match_bravo_group_id on "GroupMatch"("bravoGroupId")`
  ).run();
  db.prepare(
    `create index group_match_reported_by_user_id on "GroupMatch"("reportedByUserId")`
  ).run();

  db.prepare(
    /*sql*/ `
    create table "GroupMatchMap" (
      "matchId" integer not null,
      "index" integer not null,
      "mode" text not null,
      "stageId" integer not null,
      "source" text not null,
      "winnerGroupId" integer not null,
      foreign key ("matchId") references "GroupMatch"("id") on delete cascade,
      foreign key ("winnerGroupId") references "Group"("id") on delete restrict,
      unique("matchId", "index") on conflict rollback
    ) strict
  `
  ).run();

  db.prepare(
    `create index group_match_map_match_id on "GroupMatchMap"("matchId")`
  ).run();
  db.prepare(
    `create index group_match_map_winner_group_id on "GroupMatchMap"("winnerGroupId")`
  ).run();
};