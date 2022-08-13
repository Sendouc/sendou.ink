import { sql } from "../sql";
import type { Badge, User } from "../types";

const deleteManyManagersStm = sql.prepare(`
  DELETE FROM
    "BadgeManager"
  WHERE
    "badgeId" = $badgeId
`);

const createManagerStm = sql.prepare(`
  INSERT INTO 
    "BadgeManager" (
      "badgeId",
      "userId"
    )
    VALUES
    (
      $badgeId,
      $userId
    )
`);

export const upsertManyManagers = sql.transaction(
  ({
    badgeId,
    managerIds,
  }: {
    badgeId: Badge["id"];
    managerIds: Array<User["id"]>;
  }) => {
    deleteManyManagersStm.run({
      badgeId,
    });

    for (const userId of managerIds) {
      createManagerStm.run({
        userId,
        badgeId,
      });
    }
  }
);

const deleteManyOwnersStm = sql.prepare(`
  DELETE FROM
    "TournamentBadgeOwner"
  WHERE
    "badgeId" = $badgeId
`);

const createOwnerStm = sql.prepare(`
  INSERT INTO 
    "TournamentBadgeOwner" (
      "badgeId",
      "userId"
    )
    VALUES
    (
      $badgeId,
      $userId
    )
`);

export const upsertManyOwners = sql.transaction(
  ({
    badgeId,
    ownerIds,
  }: {
    badgeId: Badge["id"];
    ownerIds: Array<User["id"]>;
  }) => {
    deleteManyOwnersStm.run({
      badgeId,
    });

    for (const userId of ownerIds) {
      createOwnerStm.run({
        userId,
        badgeId,
      });
    }
  }
);

const countsByUserIdStm = sql.prepare(`
  select 
      "Badge"."code", 
      "Badge"."displayName", 
      "Badge"."id", 
      "Badge"."hue", 
      count("BadgeOwner"."badgeId") as count 
    from "BadgeOwner" 
    join "Badge" on "Badge"."id" = "BadgeOwner"."badgeId"
    where "BadgeOwner"."userId" = $userId 
    group by "BadgeOwner"."badgeId", "BadgeOwner"."userId"
  `);

export type CountsByUserId = Array<
  Pick<Badge, "code" | "displayName" | "id" | "hue"> & {
    count: number;
  }
>;

export function countsByUserId(userId: User["id"]) {
  return countsByUserIdStm.all({ userId }) as CountsByUserId;
}

const allStm = sql.prepare(`
  select 
      "Badge"."id", 
      "Badge"."code", 
      "Badge"."displayName", 
      "Badge"."hue"
    from "Badge"
`);

export type All = Array<Pick<Badge, "id" | "displayName" | "code" | "hue">>;

export function all() {
  return allStm.all() as All;
}

export type OwnersByBadgeId = Array<
  Pick<User, "id" | "discordId" | "discordName" | "discordDiscriminator"> & {
    count: number;
  }
>;

const ownersByBadgeIdStm = sql.prepare(`
  select 
    count("BadgeOwner"."badgeId") as count, 
    "User"."id",
    "User"."discordId",
    "User"."discordName",
    "User"."discordDiscriminator"
  from "BadgeOwner" 
  join "User" on "User"."id" = "BadgeOwner"."userId"
  where "BadgeOwner"."badgeId" = $id
  group by "User"."id"
  order by count desc, "User"."discordName" collate nocase asc
`);

export function ownersByBadgeId(id: Badge["id"]) {
  return ownersByBadgeIdStm.all({ id }) as OwnersByBadgeId;
}

export type ManagersByBadgeId = Array<
  Pick<User, "id" | "discordId" | "discordName" | "discordDiscriminator">
>;

const managersByBadgeIdStm = sql.prepare(`
  select 
    "User"."id",
    "User"."discordId",
    "User"."discordName",
    "User"."discordDiscriminator"
  from "BadgeManager" 
  join "User" on "User"."id" = "BadgeManager"."userId"
  where "BadgeManager"."badgeId" = $id
`);

export function managersByBadgeId(id: Badge["id"]) {
  return managersByBadgeIdStm.all({ id }) as ManagersByBadgeId;
}

const managedByUserIdStm = sql.prepare(`
  select
    "Badge"."id",
    "Badge"."code",
    "Badge"."displayName",
    "Badge"."hue"
  from "BadgeManager" 
  join "Badge" on "Badge"."id" = "BadgeManager"."badgeId"
  where "userId" = $userId
`);

export function managedByUserId(userId: User["id"]) {
  return managedByUserIdStm.all({ userId }) as Array<
    Pick<Badge, "id" | "code" | "displayName" | "hue">
  >;
}
