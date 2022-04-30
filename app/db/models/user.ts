import { sql } from "../sqlite3";
import type { User } from "../types";

const createStm = sql.prepare(`
  INSERT INTO
    users (
      discord_id,
      discord_name,
      discord_discriminator,
      discord_avatar,
      twitch,
      twitter,
      youtube_id,
      youtube_name,
      friend_code
    )
    VALUES (
      $discord_id,
      $discord_name,
      $discord_discriminator,
      $discord_avatar,
      $twitch,
      $twitter,
      $youtube_id,
      $youtube_name,
      $friend_code
    )
`);

export function create(input: Omit<User, "id">) {
  createStm.run(input);
}
