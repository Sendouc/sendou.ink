import { db } from "~/db/sql";
import type { UserMapModePreferences } from "~/db/tables";

export async function mapModePreferencesByUserId(userId: number) {
  return (
    await db
      .selectFrom("User")
      .select("mapModePreferences")
      .where("id", "=", userId)
      .executeTakeFirst()
  )?.mapModePreferences;
}

export function updateUserMapModePreferences({
  userId,
  mapModePreferences,
}: {
  userId: number;
  mapModePreferences: UserMapModePreferences;
}) {
  return db
    .updateTable("User")
    .set({ mapModePreferences: JSON.stringify(mapModePreferences) })
    .where("id", "=", userId)
    .execute();
}
