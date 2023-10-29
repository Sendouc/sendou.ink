import type { ExpressionBuilder, FunctionModule } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { dbNew } from "~/db/sql";
import type { DB, TablesInsertable } from "~/db/tables";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { safeNumberParse } from "~/utils/number";

export function identifierToUserId(identifier: string) {
  return dbNew
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
    })
    .executeTakeFirst();
}

export function findLeanById(id: number) {
  return dbNew
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
  return dbNew
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

const withMaxEventStartTime = (eb: ExpressionBuilder<DB, "CalendarEvent">) => {
  return eb
    .selectFrom("CalendarEventDate")
    .select(({ fn }) => [fn.max("CalendarEventDate.startTime").as("startTime")])
    .whereRef("CalendarEventDate.eventId", "=", "CalendarEvent.id")
    .as("startTime");
};
export function findResultsByUserId(userId: number) {
  return dbNew
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
      // xxx: can we get rid of as?
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
      dbNew
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
              .selectFrom("TournamentTeamMember")
              .innerJoin("User", "User.id", "TournamentTeamMember.userId")
              .select([
                ...COMMON_USER_FIELDS,
                sql<string | null>`null`.as("name"),
              ])
              .whereRef(
                "TournamentTeamMember.tournamentTeamId",
                "=",
                "TournamentTeam.id",
              )
              .where("TournamentTeamMember.userId", "!=", userId),
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

  return dbNew
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
  let query = dbNew
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
  return dbNew.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("UserWeapon")
      .where("userId", "=", args.userId)
      .execute();

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
