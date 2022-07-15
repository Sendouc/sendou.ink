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

export function updateProfile(args: Pick<User, "country" | "id" | "bio">) {
  updateProfileStm.run(args);
}

const updateByDiscordIdStm = sql.prepare(`
  update "User"
    set "discordAvatar" = $discordAvatar,
        "discordName" = $discordName,
        "discordDiscriminator" = $discordDiscriminator
    where "discordId" = $discordId
`);

export const updateMany = sql.transaction(
  (
    argsArr: Array<
      Pick<
        User,
        "discordAvatar" | "discordName" | "discordDiscriminator" | "discordId"
      >
    >
  ) => {
    for (const updateArgs of argsArr) {
      updateByDiscordIdStm.run(updateArgs);
    }
  }
);

const deleteAllPatronDataStm = sql.prepare(`
  update "User"
    set "patronTier" = null,
        "patronSince" = null
`);

const addPatronDataStm = sql.prepare(`
  update "User"
  set "patronTier" = $patronTier,
      "patronSince" = $patronSince
  where "discordId" = $discordId
`);

export type UpdatePatronDataArgs = Array<
  Pick<User, "discordId" | "patronTier" | "patronSince">
>;
export const updatePatronData = sql.transaction(
  (argsArr: UpdatePatronDataArgs) => {
    deleteAllPatronDataStm.run();

    for (const args of argsArr) {
      addPatronDataStm.run(args);
    }
  }
);

const deleteStm = sql.prepare(`
  delete from "User" where id = $id
    returning *
`);

const updateDiscordId = sql.prepare(`
  update "User" 
    set "discordId" = $discordId
    where "id" = $id
`);

export const migrate = sql.transaction(
  (args: { newUserId: User["id"]; oldUserId: User["id"] }) => {
    const deletedUser = deleteStm.get({ id: args.newUserId }) as User;

    updateDiscordId.run({
      id: args.oldUserId,
      discordId: deletedUser.discordId,
    });
  }
);

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

export function findAllPlusMembers() {
  return findAllPlusMembersStm.all() as Array<{
    discordId: User["discordId"];
    plusTier: NonNullable<UserWithPlusTier["plusTier"]>;
  }>;
}

const findAllPatronsStm = sql.prepare(`
  select
    "id",
    "discordId",
    "discordName",
    "discordDiscriminator",
    "patronTier"
  from "User"
  where "patronTier" is not null
  order by "patronTier" desc, "patronSince" asc
`);

export type FindAllPatrons = Array<
  Pick<
    User,
    "id" | "discordId" | "discordName" | "discordDiscriminator" | "patronTier"
  >
>;
export function findAllPatrons() {
  return findAllPatronsStm.all() as FindAllPatrons;
}
