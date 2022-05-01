import { sql } from "../sqlite3";
import type { User } from "../types";

const upsertStm = sql.prepare(`
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
    ON CONFLICT(discord_id) DO UPDATE SET
      discord_name = excluded.discord_name,
      discord_discriminator = excluded.discord_discriminator,
      discord_avatar = excluded.discord_avatar,
      twitch = excluded.twitch,
      twitch = excluded.twitch,
      youtube_id = excluded.youtube_id,
      youtube_name = excluded.youtube_name
    RETURNING *
`);

export function upsert(input: Omit<User, "id">) {
  return upsertStm.get(input) as User;
}
