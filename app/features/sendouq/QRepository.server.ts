import { db } from "~/db/sql";

export async function mapModePreferencesByGroupId(groupId: number) {
  const rows = await db
    .selectFrom("GroupMember")
    .innerJoin("User", "User.id", "GroupMember.userId")
    .select("User.mapModePreferences")
    .where("GroupMember.groupId", "=", groupId)
    .execute();

  return rows.flatMap((row) => row.mapModePreferences ?? []);
}
