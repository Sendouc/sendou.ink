import { sql } from "../sql";
import type { Badge, User } from "../types";

const countsByUserIdStm = sql.prepare(`
  select "Badge"."code", "Badge"."displayName", count("BadgeOwner"."badgeId") as count 
    from "BadgeOwner" 
    join "Badge" on "Badge"."id" = "BadgeOwner"."badgeId"
    where "BadgeOwner"."userId" = $userId 
    group by "BadgeOwner"."badgeId", "BadgeOwner"."userId"
  `);

export type CountsByUserId = Array<
  Pick<Badge, "code" | "displayName"> & {
    count: number;
  }
>;

export function countsByUserId(userId: User["id"]) {
  return countsByUserIdStm.all({ userId }) as CountsByUserId;
}

// xxx: make it so that it returns all badges not just owned
const allWithAtLeastOneOwnerStm = sql.prepare(`
  select "Badge"."id", "Badge"."code", "Badge"."displayName"
    from "Badge"
    join "BadgeOwner" on "BadgeOwner"."badgeId" = "Badge"."id"
    group by "Badge"."id"
    having count("BadgeOwner"."userId") > 0
`);

export type AllWithAtLeastOneOwner = Array<
  Pick<Badge, "id" | "displayName" | "code">
>;

export function allWithAtLeastOneOwner() {
  return allWithAtLeastOneOwnerStm.all() as AllWithAtLeastOneOwner;
}

export type OwnersByBadge = Array<
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
    order by count desc
`);

export function ownersByBadgeId(id: Badge["id"]) {
  return ownersByBadgeIdStm.all({ id }) as OwnersByBadge;
}
