import { sql } from "../../sql";
import type {
  CalendarEventResultTeam,
  User,
  UserWithPlusTier,
} from "../../types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { parseDBArray } from "~/utils/sql";
import { dateToDatabaseTimestamp } from "~/utils/dates";

import addPatronDataSql from "./addPatronData.sql";
import addResultHighlightSql from "./addResultHighlight.sql";
import deleteAllPatronDataSql from "./deleteAllPatronData.sql";
import deleteAllResultHighlightsSql from "./deleteAllResultHighlights.sql";
import deleteByIdSql from "./deleteById.sql";
import findAllSql from "./findAll.sql";
import findAllPatronsSql from "./findAllPatrons.sql";
import findAllPlusMembersSql from "./findAllPlusMembers.sql";
import findByIdentifierSql from "./findByIdentifier.sql";
import searchSql from "./search.sql";
import updateByDiscordIdSql from "./updateByDiscordId.sql";
import updateDiscordIdSql from "./updateDiscordId.sql";
import updateProfileSql from "./updateProfile.sql";
import upsertSql from "./upsert.sql";
import addUserWeaponSql from "./addUserWeapon.sql";
import deleteUserWeaponsSql from "./deleteUserWeapons.sql";
import wipePlusTiersSql from "./wipePlusTiers.sql";
import fillPlusTiersSql from "./fillPlusTiers.sql";
import forcePatronSql from "./forcePatron.sql";

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
const addUserWeaponStm = sql.prepare(addUserWeaponSql);
const deleteUserWeaponsStm = sql.prepare(deleteUserWeaponsSql);
export const updateProfile = sql.transaction(
  ({
    weapons,
    ...rest
  }: Pick<
    User,
    | "country"
    | "id"
    | "bio"
    | "customUrl"
    | "motionSens"
    | "stickSens"
    | "inGameName"
    | "css"
  > & { weapons: MainWeaponId[] }) => {
    deleteUserWeaponsStm.run({ userId: rest.id });
    for (const [i, weaponSplId] of weapons.entries()) {
      addUserWeaponStm.run({ userId: rest.id, weaponSplId, order: i + 1 });
    }

    return updateProfileStm.get(rest) as User;
  }
);

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
    deleteAllPatronDataStm.run({ now: dateToDatabaseTimestamp(new Date()) });

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
  const {
    weapons,
    teamName,
    teamCustomUrl,
    teamAvatarUrl,
    teamId,
    css,
    ...row
  } = findByIdentifierStm.get({ identifier });

  if (!row.id) return;

  return {
    ...row,
    css: css ? JSON.parse(css) : undefined,
    weapons: parseDBArray(weapons),
    team: teamName
      ? {
          name: teamName,
          customUrl: teamCustomUrl,
          avatarUrl: teamAvatarUrl,
          id: teamId,
        }
      : undefined,
  } as
    | (Omit<UserWithPlusTier, "css"> & {
        css: Record<string, string>;
        weapons: MainWeaponId[];
        team?: {
          name: string;
          customUrl: string;
          avatarUrl?: string;
          id: number;
        };
      })
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

const forcePatronStm = sql.prepare(forcePatronSql);
export function forcePatron(
  user: Pick<User, "id" | "patronSince" | "patronTill" | "patronTier">
) {
  forcePatronStm.run(user);
}

const deleteAllResultHighlightsStm = sql.prepare(deleteAllResultHighlightsSql);
const addResultHighlightStm = sql.prepare(addResultHighlightSql);
export type UpdateResultHighlightsArgs = {
  userId: User["id"];
  resultTeamIds: Array<CalendarEventResultTeam["id"]>;
};
export const updateResultHighlights = sql.transaction(
  ({ userId, resultTeamIds }: UpdateResultHighlightsArgs) => {
    deleteAllResultHighlightsStm.run({ userId });
    for (const teamId of resultTeamIds) {
      addResultHighlightStm.run({ userId, teamId });
    }
  }
);

const searchStm = sql.prepare(searchSql);
export function search(input: string) {
  const searchString = `%${input}%`;

  return searchStm.all({
    discordName: searchString,
    inGameName: searchString,
    twitter: searchString,
  }) as Array<
    Pick<
      User,
      | "discordId"
      | "discordAvatar"
      | "discordName"
      | "discordDiscriminator"
      | "customUrl"
      | "inGameName"
    >
  >;
}

const wipePlusTiersStm = sql.prepare(wipePlusTiersSql);
const fillPlusTiersStm = sql.prepare(fillPlusTiersSql);
export const refreshPlusTiers = sql.transaction(() => {
  wipePlusTiersStm.run();
  fillPlusTiersStm.run();
});
