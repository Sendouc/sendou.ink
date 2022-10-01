import { sql } from "../../sql";
import type { User, UserWithPlusTier } from "../../types";

import upsertSql from "./upsert.sql";
import updateProfileSql from "./updateProfile.sql";
import updateByDiscordIdSql from "./updateByDiscordId.sql";
import deleteAllPatronDataSql from "./deleteAllPatronData.sql";
import addPatronDataSql from "./addPatronData.sql";
import findAllSql from "./findAll.sql";
import deleteByIdSql from "./deleteById.sql";
import updateDiscordIdSql from "./updateDiscordId.sql";
import findByIdentifierSql from "./findByIdentifier.sql";
import findAllPlusMembersSql from "./findAllPlusMembers.sql";
import findAllPatronsSql from "./findAllPatrons.sql";

const upsertStm = sql.prepare(upsertSql);
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

const updateProfileStm = sql.prepare(updateProfileSql);
export function updateProfile(
  args: Pick<
    User,
    | "country"
    | "id"
    | "bio"
    | "customUrl"
    | "motionSens"
    | "stickSens"
    | "inGameName"
  >
) {
  return updateProfileStm.get(args) as User;
}

const updateByDiscordIdStm = sql.prepare(updateByDiscordIdSql);
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

const deleteAllPatronDataStm = sql.prepare(deleteAllPatronDataSql);
const addPatronDataStm = sql.prepare(addPatronDataSql);
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

const deleteByIdStm = sql.prepare(deleteByIdSql);
const updateDiscordIdStm = sql.prepare(updateDiscordIdSql);
export const migrate = sql.transaction(
  (args: { newUserId: User["id"]; oldUserId: User["id"] }) => {
    const deletedUser = deleteByIdStm.get({ id: args.newUserId }) as User;

    updateDiscordIdStm.run({
      id: args.oldUserId,
      discordId: deletedUser.discordId,
    });
  }
);

const findByIdentifierStm = sql.prepare(findByIdentifierSql);
export function findByIdentifier(identifier: string | number) {
  return findByIdentifierStm.get({ identifier }) as
    | UserWithPlusTier
    | undefined;
}

const findAllStm = sql.prepare(findAllSql);

export function findAll() {
  return findAllStm.all() as Pick<
    UserWithPlusTier,
    "id" | "discordId" | "discordName" | "discordDiscriminator" | "plusTier"
  >[];
}

const findAllPlusMembersStm = sql.prepare(findAllPlusMembersSql);
export function findAllPlusMembers() {
  return findAllPlusMembersStm.all() as Array<{
    discordId: User["discordId"];
    plusTier: NonNullable<UserWithPlusTier["plusTier"]>;
  }>;
}

const findAllPatronsStm = sql.prepare(findAllPatronsSql);
export type FindAllPatrons = Array<
  Pick<
    User,
    "id" | "discordId" | "discordName" | "discordDiscriminator" | "patronTier"
  >
>;
export function findAllPatrons() {
  return findAllPatronsStm.all() as FindAllPatrons;
}
