import { sql } from "../sql";
import type { User } from "../types";

const upsertStm = sql.prepare(`
  INSERT INTO
    "User" (
      "discordId",
      "discordName",
      "discordDiscriminator",
      "discordAvatar",
      "twitch",
      "twitter",
      "youtubeId",
      "youtubeName"
    )
    VALUES (
      $discordId,
      $discordName,
      $discordDiscriminator,
      $discordAvatar,
      $twitch,
      $twitter,
      $youtubeId,
      $youtubeName
    )
    ON CONFLICT("discordId") DO UPDATE SET
      "discordName" = excluded."discordName",
      "discordDiscriminator" = excluded."discordDiscriminator",
      "discordAvatar" = excluded."discordAvatar",
      "twitch" = excluded."twitch",
      "twitch" = excluded."twitch",
      "youtubeId" = excluded."youtubeId",
      "youtubeName" = excluded."youtubeName"
    RETURNING *
`);

export function upsert(
  input: Pick<
    User,
    | "discordId"
    | "discordName"
    | "discordDiscriminator"
    | "discordAvatar"
    | "twitch"
    | "twitter"
    | "youtubeId"
    | "youtubeName"
  >
) {
  return upsertStm.get(input) as User;
}

const findByIdentifierStm = sql.prepare(`
  SELECT *
    FROM "User"
    WHERE "discordId" = $identifier
`);

export function findByIdentifier(identifier: string) {
  return findByIdentifierStm.get({ identifier }) as User | undefined;
}
