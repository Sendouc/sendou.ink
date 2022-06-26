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

// xxx: but how does admin give to rights to badge if those with 0 owners don't show?
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
