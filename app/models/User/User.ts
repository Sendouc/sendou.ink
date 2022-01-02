import { z } from "zod";
import { Database } from "~/utils/db.server";
import { Model } from "~/models/common/Model";
import type { Optional } from "~/utils";
import { Helpers } from "../common/Helpers";

export const UserSchema = z.object({
  id: z.string(),
  discord_id: z.string(),
  discord_name: z.string(),
  discord_discriminator: z.string(),
  discord_avatar: z.string().nullable(),
  discord_refresh_token: z.string(),
  twitch: z.string().nullable(),
  twitter: z.string().nullable(),
  youtube_id: z.string().nullable(),
  youtube_name: z.string().nullable(),
  created_at_timestamp: z.string(),
  updated_at_timestamp: z.string(),
});

export type UserI = z.infer<typeof UserSchema>;

export class UserModel extends Model {
  #createStmt;
  constructor(db: Database["db"]) {
    super();
    this.#createStmt = this.prepareSql(db, __dirname, "create_user.sql");
  }

  create(
    args: Optional<
      Omit<UserI, "created_at_timestamp" | "updated_at_timestamp">,
      "id"
    >
  ) {
    return this.#createStmt.run({
      ...args,
      ...Helpers.id(args.id),
      ...Helpers.createdAt,
      ...Helpers.updatedAt,
    });
  }
}
