import { dbNew } from "~/db/sql";
import type { Unwrapped } from "~/utils/types";

export function all() {
  return dbNew
    .selectFrom("Badge")
    .select(["id", "displayName", "code", "hue"])
    .execute();
}

export function findManagersByBadgeId(badgeId: number) {
  return (
    dbNew
      .selectFrom("BadgeManager")
      .innerJoin("User", "BadgeManager.userId", "User.id")
      // xxx: common user fields?
      .select(["User.id", "User.discordId", "User.discordName"])
      .where("BadgeManager.badgeId", "=", badgeId)
      .execute()
  );
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
