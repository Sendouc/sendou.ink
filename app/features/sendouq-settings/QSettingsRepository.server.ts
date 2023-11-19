import { db } from "~/db/sql";
import type { Tables, UserMapModePreferences } from "~/db/tables";

export async function preferencesByUserId(userId: number) {
  const preferences = await db
    .selectFrom("User")
    .select(["User.mapModePreferences", "User.vc", "User.languages"])
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  return {
    ...preferences,
    languages: preferences.languages?.split(","),
  };
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

export function updateVoiceChat(args: {
  userId: number;
  vc: Tables["User"]["vc"];
  languages: string[];
}) {
  return db
    .updateTable("User")
    .set({
      vc: args.vc,
      languages: args.languages.length > 0 ? args.languages.join(",") : null,
    })
    .where("User.id", "=", args.userId)
    .execute();
}
