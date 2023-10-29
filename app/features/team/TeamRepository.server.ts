import { dbNew } from "~/db/sql";

export function findByUserId(userId: number) {
  return dbNew
    .selectFrom("TeamMember")
    .innerJoin("Team", "Team.id", "TeamMember.teamId")
    .select(["Team.id", "Team.customUrl"])
    .where("TeamMember.userId", "=", userId)
    .executeTakeFirst();
}
