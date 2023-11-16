import { db } from "~/db/sql";
import type { UserMapModePreferences } from "~/db/tables";

export function mapModePreferencesByGroupId(groupId: number) {
  return db
    .selectFrom("GroupMember")
    .innerJoin("User", "User.id", "GroupMember.userId")
    .select(["User.id as userId", "User.mapModePreferences as preferences"])
    .where("GroupMember.groupId", "=", groupId)
    .where("User.mapModePreferences", "is not", null)
    .execute() as Promise<
    { userId: number; preferences: UserMapModePreferences }[]
  >;
}
