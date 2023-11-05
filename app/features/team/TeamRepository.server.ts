import { db } from "~/db/sql";

export function findByUserId(userId: number) {
  return db
    .selectFrom("TeamMember")
    .innerJoin("Team", "Team.id", "TeamMember.teamId")
    .select(["Team.id", "Team.customUrl"])
    .where("TeamMember.userId", "=", userId)
    .executeTakeFirst();
}
