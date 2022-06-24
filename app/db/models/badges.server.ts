import { sql } from "../sql";
import type { Badge, User } from "../types";

const countsByUserIdStm = sql.prepare(`
  select "Badge"."code", "Badge"."displayName", count("BadgeOwner"."code") as count 
    from "BadgeOwner" 
    join "Badge" on "Badge"."code" = "BadgeOwner"."code"
    where "BadgeOwner"."userId" = $userId 
    group by "BadgeOwner"."code", "BadgeOwner"."userId"
  `);

export type CountsByUserId = Array<
  Pick<Badge, "code" | "displayName"> & {
    count: number;
  }
>;

export function countsByUserId(userId: User["id"]) {
  return countsByUserIdStm.all({ userId }) as CountsByUserId;
}
