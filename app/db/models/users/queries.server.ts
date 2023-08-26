import { sql } from "../../sql";
import type {
  CalendarEventResultTeam,
  SplatoonPlayer,
  TournamentTeam,
  User,
  UserWeapon,
  UserWithPlusTier,
} from "../../types";
import { parseDBJsonArray } from "~/utils/sql";
import { dateToDatabaseTimestamp } from "~/utils/dates";

import addPatronDataSql from "./addPatronData.sql";
import addResultHighlightSql from "./addResultHighlight.sql";
import addTournamentResultHighlightSql from "./addTournamentResultHighlight.sql";
import deleteAllPatronDataSql from "./deleteAllPatronData.sql";
import deleteAllResultHighlightsSql from "./deleteAllResultHighlights.sql";
import deleteAllTournamentResultHighlightsSql from "./deleteAllTournamentResultHighlights.sql";
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
import makeVideoAdderSql from "./makeVideoAdder.sql";
import linkPlayerSql from "./linkPlayer.sql";
import unlinkPlayerSql from "./unlinkPlayer.sql";
import { syncXPBadges } from "~/features/badges";

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
    | "discordUniqueName"
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
    | "favoriteBadgeId"
    | "showDiscordUniqueName"
    | "commissionText"
    | "commissionsOpen"
  > & { weapons: Pick<UserWeapon, "weaponSplId" | "isFavorite">[] }) => {
    deleteUserWeaponsStm.run({ userId: rest.id });
    for (const [i, weapon] of weapons.entries()) {
      addUserWeaponStm.run({
        userId: rest.id,
        weaponSplId: weapon.weaponSplId,
        isFavorite: weapon.isFavorite,
        order: i + 1,
      });
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
        "discordAvatar" | "discordName" | "discordUniqueName" | "discordId"
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
  } = findByIdentifierStm.get({ identifier }) as any;

  if (!row.id) return;

  return {
    ...row,
    css: css ? JSON.parse(css) : undefined,
    weapons: parseDBJsonArray(weapons),
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
        weapons: Pick<UserWeapon, "weaponSplId" | "isFavorite">[];
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
const deleteAllTournamentResultHighlightsStm = sql.prepare(
  deleteAllTournamentResultHighlightsSql
);
const addResultHighlightStm = sql.prepare(addResultHighlightSql);
const addTournamentResultHighlightStm = sql.prepare(
  addTournamentResultHighlightSql
);
export type UpdateResultHighlightsArgs = {
  userId: User["id"];
  resultTeamIds: Array<CalendarEventResultTeam["id"]>;
  resultTournamentTeamIds: Array<TournamentTeam["id"]>;
};
export const updateResultHighlights = sql.transaction(
  ({
    userId,
    resultTeamIds,
    resultTournamentTeamIds,
  }: UpdateResultHighlightsArgs) => {
    deleteAllResultHighlightsStm.run({ userId });
    deleteAllTournamentResultHighlightsStm.run({ userId });
    for (const teamId of resultTeamIds) {
      addResultHighlightStm.run({ userId, teamId });
    }
    for (const tournamentTeamId of resultTournamentTeamIds) {
      addTournamentResultHighlightStm.run({ userId, tournamentTeamId });
    }
  }
);

// xxx: search by discordUniqueName
const searchStm = sql.prepare(searchSql);
export function search({ input, limit }: { input: string; limit: number }) {
  const searchString = `%${input}%`;

  return (
    searchStm.all({
      discordName: searchString,
      inGameName: searchString,
      twitter: searchString,
      limit,
    }) as Array<
      Pick<
        UserWithPlusTier,
        | "id"
        | "discordId"
        | "discordAvatar"
        | "discordName"
        | "discordDiscriminator"
        | "customUrl"
        | "inGameName"
        | "discordUniqueName"
        | "showDiscordUniqueName"
        | "plusTier"
      >
    >
  ).map((user) => ({
    ...user,
    discordUniqueName: user.showDiscordUniqueName
      ? user.discordUniqueName
      : undefined,
  }));
}

const wipePlusTiersStm = sql.prepare(wipePlusTiersSql);
const fillPlusTiersStm = sql.prepare(fillPlusTiersSql);
export const refreshPlusTiers = sql.transaction(() => {
  wipePlusTiersStm.run();
  fillPlusTiersStm.run();
});

const makeVideoAdderStm = sql.prepare(makeVideoAdderSql);
export function makeVideoAdder(id: User["id"]) {
  return makeVideoAdderStm.run({ id });
}

const linkPlayerStm = sql.prepare(linkPlayerSql);
const unlinkPlayerStm = sql.prepare(unlinkPlayerSql);
export function linkPlayer({
  userId,
  playerId,
}: {
  userId: User["id"];
  playerId: SplatoonPlayer["id"];
}) {
  unlinkPlayerStm.run({ userId });
  linkPlayerStm.run({ userId, playerId });
  syncXPBadges();
}
