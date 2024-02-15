import type { ExpressionBuilder, FunctionModule } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db, sql as dbDirect } from "~/db/sql";
import type { DB, TablesInsertable } from "~/db/tables";
import type { User } from "~/db/types";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { safeNumberParse } from "~/utils/number";

const identifierToUserIdQuery = (identifier: string) =>
  db
    .selectFrom("User")
    .select("User.id")
    .where((eb) => {
      // we don't want to parse discord id's as numbers (length = 18)
      const parsedId =
        identifier.length < 10 ? safeNumberParse(identifier) : null;
      if (parsedId) {
        return eb("User.id", "=", parsedId);
      }

      return eb.or([
        eb("User.discordId", "=", identifier),
        eb("User.customUrl", "=", identifier),
      ]);
    });

export function identifierToUserId(identifier: string) {
  return identifierToUserIdQuery(identifier).executeTakeFirst();
}

export function findByIdentifier(identifier: string) {
  return identifierToUserIdQuery(identifier)
    .leftJoin("PlusTier", "PlusTier.userId", "User.id")
    .select(({ eb }) => [
      "User.discordAvatar",
      "User.discordDiscriminator",
      "User.discordId",
      "User.discordName",
      "User.showDiscordUniqueName",
      "User.discordUniqueName",
      "User.customUrl",
      "User.inGameName",
      "User.twitter",
      "User.country",
      "User.bio",
      "User.motionSens",
      "User.stickSens",
      "User.css",
      "User.twitch",
      "User.twitter",
      "User.youtubeId",
      "User.favoriteBadgeId",
      "User.banned",
      "User.commissionText",
      "User.commissionsOpen",
      "User.patronTier",
      "PlusTier.tier as plusTier",
      jsonArrayFrom(
        eb
          .selectFrom("UserWeapon")
          .select(["UserWeapon.weaponSplId", "UserWeapon.isFavorite"])
          .whereRef("UserWeapon.userId", "=", "User.id")
          .orderBy("UserWeapon.order", "asc"),
      ).as("weapons"),
      jsonObjectFrom(
        eb
          .selectFrom("TeamMember")
          .innerJoin("Team", "Team.id", "TeamMember.teamId")
          .leftJoin(
            "UserSubmittedImage",
            "UserSubmittedImage.id",
            "Team.avatarImgId",
          )
          .select([
            "Team.name",
            "Team.customUrl",
            "Team.id",
            "UserSubmittedImage.url as avatarUrl",
          ])
          .whereRef("TeamMember.userId", "=", "User.id"),
      ).as("team"),
    ])
    .executeTakeFirst();
}

export function findLeanById(id: number) {
  return db
    .selectFrom("User")
    .leftJoin("PlusTier", "PlusTier.userId", "User.id")
    .where("User.id", "=", id)
    .select([
      ...COMMON_USER_FIELDS,
      "User.isArtist",
      "User.isVideoAdder",
      "User.patronTier",
      "User.favoriteBadgeId",
      "User.banned",
      "User.languages",
      "PlusTier.tier as plusTier",
    ])
    .executeTakeFirst();
}

export function findAllPatrons() {
  return db
    .selectFrom("User")
    .select([
      "User.id",
      "User.discordId",
      "User.discordName",
      "User.discordDiscriminator",
      "User.patronTier",
    ])
    .where("User.patronTier", "is not", null)
    .orderBy("User.patronTier", "desc")
    .orderBy("User.patronSince", "asc")
    .execute();
}

export function findAllPlusMembers() {
  return db
    .selectFrom("User")
    .innerJoin("PlusTier", "PlusTier.userId", "User.id")
    .select(["User.id", "User.discordId", "PlusTier.tier as plusTier"])
    .execute();
}

const withMaxEventStartTime = (eb: ExpressionBuilder<DB, "CalendarEvent">) => {
  return eb
    .selectFrom("CalendarEventDate")
    .select(({ fn }) => [fn.max("CalendarEventDate.startTime").as("startTime")])
    .whereRef("CalendarEventDate.eventId", "=", "CalendarEvent.id")
    .as("startTime");
};
export function findResultsByUserId(userId: number) {
  return db
    .selectFrom("CalendarEventResultPlayer")
    .innerJoin(
      "CalendarEventResultTeam",
      "CalendarEventResultTeam.id",
      "CalendarEventResultPlayer.teamId",
    )
    .innerJoin(
      "CalendarEvent",
      "CalendarEvent.id",
      "CalendarEventResultTeam.eventId",
    )
    .select(({ eb, exists, selectFrom }) => [
      "CalendarEvent.id as eventId",
      sql<number>`null`.as("tournamentId"),
      "CalendarEventResultTeam.placement",
      "CalendarEvent.participantCount",
      "CalendarEvent.name as eventName",
      "CalendarEventResultTeam.id as teamId",
      "CalendarEventResultTeam.name as teamName",
      // TODO: can we get rid of the "as"?
      withMaxEventStartTime(eb as ExpressionBuilder<DB, "CalendarEvent">),
      exists(
        selectFrom("UserResultHighlight")
          .where("UserResultHighlight.userId", "=", userId)
          .whereRef(
            "UserResultHighlight.teamId",
            "=",
            "CalendarEventResultTeam.id",
          )
          .select("UserResultHighlight.userId"),
      ).as("isHighlight"),
      jsonArrayFrom(
        eb
          .selectFrom("CalendarEventResultPlayer")
          .leftJoin("User", "User.id", "CalendarEventResultPlayer.userId")
          .select([...COMMON_USER_FIELDS, "CalendarEventResultPlayer.name"])
          .whereRef(
            "CalendarEventResultPlayer.teamId",
            "=",
            "CalendarEventResultTeam.id",
          )
          .where((eb) =>
            eb.or([
              eb("CalendarEventResultPlayer.userId", "is", null),
              eb("CalendarEventResultPlayer.userId", "!=", userId),
            ]),
          ),
      ).as("mates"),
    ])
    .where("CalendarEventResultPlayer.userId", "=", userId)
    .unionAll(
      db
        .selectFrom("TournamentResult")
        .innerJoin(
          "TournamentTeam",
          "TournamentTeam.id",
          "TournamentResult.tournamentTeamId",
        )
        .innerJoin(
          "CalendarEvent",
          "CalendarEvent.tournamentId",
          "TournamentResult.tournamentId",
        )
        .select(({ eb }) => [
          sql<number>`null`.as("eventId"),
          "TournamentResult.tournamentId",
          "TournamentResult.placement",
          "TournamentResult.participantCount",
          "CalendarEvent.name as eventName",
          "TournamentTeam.id as teamId",
          "TournamentTeam.name as teamName",
          withMaxEventStartTime(eb),
          "TournamentResult.isHighlight",
          jsonArrayFrom(
            eb
              .selectFrom("TournamentResult as TournamentResult2")
              .innerJoin("User", "User.id", "TournamentResult2.userId")
              .select([
                ...COMMON_USER_FIELDS,
                sql<string | null>`null`.as("name"),
              ])
              .whereRef(
                "TournamentResult2.tournamentTeamId",
                "=",
                "TournamentResult.tournamentTeamId",
              )
              .where("TournamentResult2.userId", "!=", userId),
          ).as("mates"),
        ])
        .where("TournamentResult.userId", "=", userId),
    )
    .orderBy("startTime", "desc")
    .execute();
}

const searchSelectedFields = ({ fn }: { fn: FunctionModule<DB, "User"> }) =>
  [
    ...COMMON_USER_FIELDS,
    "User.inGameName",
    "PlusTier.tier as plusTier",
    fn<string | null>("iif", [
      "User.showDiscordUniqueName",
      "User.discordUniqueName",
      sql`null`,
    ]).as("discordUniqueName"),
  ] as const;
export function search({ query, limit }: { query: string; limit: number }) {
  const criteria = `%${query}%`;

  return db
    .selectFrom("User")
    .leftJoin("PlusTier", "PlusTier.userId", "User.id")
    .select(searchSelectedFields)
    .where((eb) =>
      eb.or([
        eb("User.discordName", "like", criteria),
        eb("User.inGameName", "like", criteria),
        eb("User.discordUniqueName", "like", criteria),
        eb("User.twitter", "like", criteria),
      ]),
    )
    .orderBy(
      (eb) =>
        eb
          .case()
          .when("PlusTier.tier", "is", null)
          .then(4)
          .else(eb.ref("PlusTier.tier"))
          .end(),
      "asc",
    )
    .limit(limit)
    .execute();
}

export function searchExact(args: {
  id?: number;
  discordId?: string;
  customUrl?: string;
}) {
  let query = db
    .selectFrom("User")
    .leftJoin("PlusTier", "PlusTier.userId", "User.id")
    .select(searchSelectedFields);

  if (args.id) {
    query = query.where("User.id", "=", args.id);
  }

  if (args.discordId) {
    query = query.where("User.discordId", "=", args.discordId);
  }

  if (args.customUrl) {
    query = query.where("User.customUrl", "=", args.customUrl);
  }

  return query.execute();
}

export async function currentFriendCodeByUserId(userId: number) {
  return (
    await db
      .selectFrom("UserFriendCode")
      .select("UserFriendCode.friendCode")
      .where("userId", "=", userId)
      .orderBy("UserFriendCode.createdAt desc")
      .limit(1)
      .executeTakeFirst()
  )?.friendCode;
}

export function insertFriendCode(args: TablesInsertable["UserFriendCode"]) {
  return db.insertInto("UserFriendCode").values(args).execute();
}

export function upsert(
  args: Pick<
    TablesInsertable["User"],
    | "discordId"
    | "discordName"
    | "discordDiscriminator"
    | "discordAvatar"
    | "discordUniqueName"
    | "twitch"
    | "twitter"
    | "youtubeId"
  >,
) {
  return db
    .insertInto("User")
    .values(args)
    .onConflict((oc) => {
      const { discordId, ...rest } = args;

      return oc.column("discordId").doUpdateSet(rest);
    })
    .returning("id")
    .executeTakeFirstOrThrow();
}

type UpdateProfileArgs = Pick<
  TablesInsertable["User"],
  | "country"
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
> & {
  userId: number;
  weapons: Pick<TablesInsertable["UserWeapon"], "weaponSplId" | "isFavorite">[];
};
export function updateProfile(args: UpdateProfileArgs) {
  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("UserWeapon")
      .where("userId", "=", args.userId)
      .execute();

    if (args.weapons.length > 0) {
      await trx
        .insertInto("UserWeapon")
        .values(
          args.weapons.map((weapon, i) => ({
            userId: args.userId,
            weaponSplId: weapon.weaponSplId,
            isFavorite: weapon.isFavorite,
            order: i + 1,
          })),
        )
        .execute();
    }

    return trx
      .updateTable("User")
      .set({
        country: args.country,
        bio: args.bio,
        customUrl: args.customUrl,
        motionSens: args.motionSens,
        stickSens: args.stickSens,
        inGameName: args.inGameName,
        css: args.css,
        favoriteBadgeId: args.favoriteBadgeId,
        showDiscordUniqueName: args.showDiscordUniqueName,
        commissionText: args.commissionText,
        commissionsOpen: args.commissionsOpen,
      })
      .where("id", "=", args.userId)
      .returning(["User.id", "User.customUrl", "User.discordId"])
      .executeTakeFirstOrThrow();
  });
}

type UpdateResultHighlightsArgs = {
  userId: number;
  resultTeamIds: Array<number>;
  resultTournamentTeamIds: Array<number>;
};
export function updateResultHighlights(args: UpdateResultHighlightsArgs) {
  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("UserResultHighlight")
      .where("userId", "=", args.userId)
      .execute();

    if (args.resultTeamIds.length > 0) {
      await trx
        .insertInto("UserResultHighlight")
        .values(
          args.resultTeamIds.map((teamId) => ({
            userId: args.userId,
            teamId,
          })),
        )
        .execute();
    }

    await trx
      .updateTable("TournamentResult")
      .set({
        isHighlight: 0,
      })
      .where("TournamentResult.userId", "=", args.userId)
      .execute();

    if (args.resultTournamentTeamIds.length > 0) {
      await trx
        .updateTable("TournamentResult")
        .set({
          isHighlight: 1,
        })
        .where("TournamentResult.userId", "=", args.userId)
        .where(
          "TournamentResult.tournamentTeamId",
          "in",
          args.resultTournamentTeamIds,
        )
        .execute();
    }
  });
}

export type UpdatePatronDataArgs = Array<
  Pick<User, "discordId" | "patronTier" | "patronSince">
>;
export function updatePatronData(users: UpdatePatronDataArgs) {
  return db.transaction().execute(async (trx) => {
    await trx
      .updateTable("User")
      .set({
        patronTier: null,
        patronSince: null,
        patronTill: null,
      })
      .where("patronTill", "<", dateToDatabaseTimestamp(new Date()))
      .execute();

    for (const user of users) {
      await trx
        .updateTable("User")
        .set({
          patronTier: user.patronTier,
          patronSince: user.patronSince,
          patronTill: null,
        })
        .where("User.discordId", "=", user.discordId)
        .execute();
    }
  });
}

// TODO: use Kysely
const updateByDiscordIdStm = dbDirect.prepare(/* sql */ `
  update
    "User"
  set
    "discordAvatar" = @discordAvatar,
    "discordName" = coalesce(@discordName, "discordName"),
    "discordUniqueName" = coalesce(@discordUniqueName, "discordUniqueName")
  where
    "discordId" = @discordId
`);
export const updateMany = dbDirect.transaction(
  (
    argsArr: Array<
      Pick<
        User,
        "discordAvatar" | "discordName" | "discordUniqueName" | "discordId"
      >
    >,
  ) => {
    for (const updateArgs of argsArr) {
      updateByDiscordIdStm.run(updateArgs);
    }
  },
);
