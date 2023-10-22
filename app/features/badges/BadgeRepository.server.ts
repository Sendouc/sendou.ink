import { dbNew } from "~/db/sql";

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
