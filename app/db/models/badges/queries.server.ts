import { sql } from "../../sql";
import type { Badge, User } from "../../types";

import deleteManyManagersSql from "./deleteManyManagers.sql";
import createManagerSql from "./createManager.sql";
import deleteManyOwnersSql from "./deleteManyOwners.sql";
import createOwnerSql from "./createOwner.sql";
import findByOwnerIdSql from "./findByOwnerId.sql";
import findAllSql from "./findAll.sql";
import ownersByBadgeIdSql from "./ownersByBadgeId.sql";
import managersByBadgeIdSql from "./managersByBadgeId.sql";
import managedByUserIdSql from "./managedByUserId.sql";

const deleteManyManagersStm = sql.prepare(deleteManyManagersSql);
const createManagerStm = sql.prepare(createManagerSql);
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

const deleteManyOwnersStm = sql.prepare(deleteManyOwnersSql);
const createOwnerStm = sql.prepare(createOwnerSql);
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

const findByOwnerIdStm = sql.prepare(findByOwnerIdSql);

export type FindByOwnerId = Array<
  Pick<Badge, "code" | "displayName" | "id" | "hue"> & {
    count: number;
  }
>;

export function findByOwnerId(userId: User["id"]) {
  return findByOwnerIdStm.all({ userId }) as FindByOwnerId;
}

const findAllStm = sql.prepare(findAllSql);

export type FindAll = Array<Pick<Badge, "id" | "displayName" | "code" | "hue">>;

export function all() {
  return findAllStm.all() as FindAll;
}

export type OwnersByBadgeId = Array<
  Pick<User, "id" | "discordId" | "discordName" | "discordDiscriminator"> & {
    count: number;
  }
>;

const ownersByBadgeIdStm = sql.prepare(ownersByBadgeIdSql);
export function ownersByBadgeId(id: Badge["id"]) {
  return ownersByBadgeIdStm.all({ id }) as OwnersByBadgeId;
}

export type ManagersByBadgeId = Array<
  Pick<User, "id" | "discordId" | "discordName" | "discordDiscriminator">
>;

const managersByBadgeIdStm = sql.prepare(managersByBadgeIdSql);
export function managersByBadgeId(id: Badge["id"]) {
  return managersByBadgeIdStm.all({ id }) as ManagersByBadgeId;
}

const managedByUserIdStm = sql.prepare(managedByUserIdSql);

export function managedByUserId(userId: User["id"]) {
  return managedByUserIdStm.all({ userId }) as Array<
    Pick<Badge, "id" | "code" | "displayName" | "hue">
  >;
}
