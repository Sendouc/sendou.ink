import type { ExpressionBuilder, FunctionModule } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { dbNew } from "~/db/sql";
import type { DB } from "~/db/tables";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";

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
