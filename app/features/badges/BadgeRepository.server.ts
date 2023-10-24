import { dbNew } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

export function all() {
  return dbNew
    .selectFrom("Badge")
    .select(["id", "displayName", "code", "hue"])
    .execute();
}

export async function findByOwnerId({
  userId,
  favoriteBadgeId,
}: {
  userId: number;
  favoriteBadgeId: number | null;
}) {
  const badges = await dbNew
    .selectFrom("BadgeOwner")
    .innerJoin("Badge", "Badge.id", "BadgeOwner.badgeId")
    .select(({ fn }) => [
      fn.count<number>("BadgeOwner.badgeId").as("count"),
      "Badge.id",
      "Badge.displayName",
      "Badge.code",
      "Badge.hue",
    ])
    .where("BadgeOwner.userId", "=", userId)
    .groupBy(["BadgeOwner.badgeId", "BadgeOwner.userId"])
    .orderBy("Badge.id", "asc")
    .execute();

  if (!favoriteBadgeId) {
    return badges;
  }

  return badges.sort((a, b) => {
    if (a.id === favoriteBadgeId) {
      return -1;
    }
    if (b.id === favoriteBadgeId) {
      return 1;
    }
    return 0;
  });
}

export function findManagedByUserId(userId: number) {
  return dbNew
    .selectFrom("BadgeManager")
    .innerJoin("Badge", "Badge.id", "BadgeManager.badgeId")
    .select(["Badge.id", "Badge.code", "Badge.displayName", "Badge.hue"])
    .where("BadgeManager.userId", "=", userId)
    .execute();
}

export function findManagersByBadgeId(badgeId: number) {
  return dbNew
    .selectFrom("BadgeManager")
    .innerJoin("User", "BadgeManager.userId", "User.id")
    .select(COMMON_USER_FIELDS)
    .where("BadgeManager.badgeId", "=", badgeId)
    .execute();
}

export type FindOwnersByBadgeIdItem = Unwrapped<typeof findOwnersByBadgeId>;
export function findOwnersByBadgeId(badgeId: number) {
  return dbNew
    .selectFrom("BadgeOwner")
    .innerJoin("User", "BadgeOwner.userId", "User.id")
    .select(({ fn }) => [
      fn.count<number>("BadgeOwner.badgeId").as("count"),
      "User.id",
      "User.discordId",
      "User.discordName",
    ])
    .where("BadgeOwner.badgeId", "=", badgeId)
    .groupBy("User.id")
    .orderBy("count", "desc")
    .execute();
}

export function replaceManagers({
  badgeId,
  managerIds,
}: {
  badgeId: number;
  managerIds: number[];
}) {
  return dbNew.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("BadgeManager")
      .where("badgeId", "=", badgeId)
      .execute();

    await trx
      .insertInto("BadgeManager")
      .values(
        managerIds.map((userId) => ({
          badgeId,
          userId,
        })),
      )
      .execute();
  });
}

export function replaceOwners({
  badgeId,
  ownerIds,
}: {
  badgeId: number;
  ownerIds: number[];
}) {
  return dbNew.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("TournamentBadgeOwner")
      .where("badgeId", "=", badgeId)
      .execute();

    await trx
      .insertInto("TournamentBadgeOwner")
      .values(
        ownerIds.map((userId) => ({
          badgeId,
          userId,
        })),
      )
      .execute();
  });
}
