import { z } from "zod";
import { Database } from "~/utils/db.server";
import { Model } from "~/utils/Model.server";

const UserSchema = z.object({
  id: z.string(),
  discord_id: z.string(),
  discord_name: z.string(),
  discord_discriminator: z.string(),
  discord_avatar: z.string().nullish(), // undefined or null..?
  discord_refresh_token: z.string(),
  twitch: z.string().nullish(),
  twitter: z.string().nullish(),
  youtube_id: z.string().nullish(),
  youtube_name: z.string().nullish(),
  created_at_timestamp: z.string(),
  updated_at_timestamp: z.string(),
});

type UserI = z.infer<typeof UserSchema>;

export class UserModel extends Model {
  #createStmt;
  constructor(db: Database["db"]) {
    super();
    this.#createStmt = this.prepareSql(db, __dirname, "create_user.sql");
  }

  create(
    args: Omit<UserI, "id" | "created_at_timestamp" | "updated_at_timestamp">
  ) {
    return this.#createStmt.run({
      ...args,
      id: "asdasdas",
      created_at_timestamp: new Date().toISOString(),
      updated_at_timestamp: new Date().toISOString(),
    });
  }
}
