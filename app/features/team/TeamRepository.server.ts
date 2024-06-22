import { db } from "~/db/sql";

export function findByUserId(userId: number) {
  return db
    .selectFrom("TeamMember")
    .innerJoin("Team", "Team.id", "TeamMember.teamId")
    .leftJoin("UserSubmittedImage", "UserSubmittedImage.id", "Team.avatarImgId")
    .select([
      "Team.id",
      "Team.customUrl",
      "Team.name",
      "UserSubmittedImage.url as logoUrl",
    ])
    .where("TeamMember.userId", "=", userId)
    .executeTakeFirst();
}
