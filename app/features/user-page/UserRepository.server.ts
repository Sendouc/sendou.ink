import type { ExpressionBuilder } from "kysely";
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
          .whereRef("CalendarEventResultPlayer.teamId", "=", "teamId")
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
