import { sql } from "../sql";
import type { User, UserWithPlusTier } from "../types";

const upsertStm = sql.prepare(`
  INSERT INTO
    "User" (
      "discordId",
      "discordName",
      "discordDiscriminator",
      "discordAvatar",
      "twitch",
      "twitter",
      "youtubeId"
    )
    VALUES (
      $discordId,
      $discordName,
      $discordDiscriminator,
      $discordAvatar,
      $twitch,
      $twitter,
      $youtubeId
    )
    ON CONFLICT("discordId") DO UPDATE SET
      "discordName" = excluded."discordName",
      "discordDiscriminator" = excluded."discordDiscriminator",
      "discordAvatar" = excluded."discordAvatar",
      "twitch" = excluded."twitch",
      "twitch" = excluded."twitch",
      "youtubeId" = excluded."youtubeId"
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
  >
) {
  return upsertStm.get(input) as User;
}

const updateProfileStm = sql.prepare(`
  UPDATE "User"
    SET "country" = $country,
        "bio" = $bio
    WHERE "id" = $id
`);

export function updateProfile(params: Pick<User, "country" | "id" | "bio">) {
  updateProfileStm.run(params);
}

const findByIdentifierStm = sql.prepare(`
  SELECT "User".*, "PlusTier".tier as "plusTier"
    FROM "User"
    LEFT JOIN "PlusTier" ON "PlusTier"."userId" = "User"."id"
    WHERE "discordId" = $identifier
      OR "id" = $identifier
`);

export function findByIdentifier(identifier: string | number) {
  return findByIdentifierStm.get({ identifier }) as
    | UserWithPlusTier
    | undefined;
}

const findAllStm = sql.prepare(`
  SELECT "User"."id", "User"."discordId", "User"."discordName", "User"."discordDiscriminator", "PlusTier".tier as "plusTier"
    FROM "User"
    LEFT JOIN "PlusTier" ON "PlusTier"."userId" = "User".id
`);

export function findAll() {
  return findAllStm.all() as Pick<
    UserWithPlusTier,
    "id" | "discordId" | "discordName" | "discordDiscriminator" | "plusTier"
  >[];
}

const findAllPlusMembersStm = sql.prepare(`
SELECT "User"."discordId", "PlusTier"."tier" as "plusTier"
  FROM "User"
  LEFT JOIN "PlusTier" ON "PlusTier"."userId" = "User".id
  WHERE "PlusTier"."tier" IS NOT NULL
`);

export type FindAllPlusMembers = Pick<
  UserWithPlusTier,
  "discordId" | "plusTier"
>[];

export function findAllPlusMembers() {
  return findAllPlusMembersStm.all() as FindAllPlusMembers;
}
