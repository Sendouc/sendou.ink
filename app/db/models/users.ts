import { sql } from "../sql";
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
      youtube_name
    )
    VALUES (
      $discord_id,
      $discord_name,
      $discord_discriminator,
      $discord_avatar,
      $twitch,
      $twitter,
      $youtube_id,
      $youtube_name
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

export function upsert(
  input: Pick<
    User,
    | "discord_id"
    | "discord_name"
    | "discord_discriminator"
    | "discord_avatar"
    | "twitch"
    | "twitter"
    | "youtube_id"
    | "youtube_name"
  >
) {
  return upsertStm.get(input) as User;
}
