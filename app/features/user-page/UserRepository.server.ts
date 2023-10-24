// select
//   "CalendarEvent"."id" as "eventId",
//   null as "tournamentId",
//   "CalendarEventResultTeam"."placement",
//   "CalendarEvent"."participantCount",
//   "CalendarEvent"."name" as "eventName",
//   "CalendarEventResultTeam"."id" as "teamId",
//   "CalendarEventResultTeam"."name" as "teamName",
//   (
//     select
//       max("startTime")
//     from
//       "CalendarEventDate"
//     where
//       "eventId" = "CalendarEvent"."id"
//   ) as "startTime",
//   exists (
//     select
//       1
//     from
//       "UserResultHighlight"
//     where
//       "userId" = @userId
//       and "teamId" = "CalendarEventResultTeam"."id"
//   ) as "isHighlight"
// from
//   "CalendarEventResultPlayer"
//   join "CalendarEventResultTeam" on "CalendarEventResultTeam"."id" = "CalendarEventResultPlayer"."teamId"
//   join "CalendarEvent" on "CalendarEvent"."id" = "CalendarEventResultTeam"."eventId"
// where
//   "CalendarEventResultPlayer"."userId" = @userId
// union
// all
// select
//   null as "eventId",
//   "TournamentResult"."tournamentId",
//   "TournamentResult"."placement",
//   "TournamentResult"."participantCount",
//   "CalendarEvent"."name" as "eventName",
//   "TournamentTeam"."id" as "teamId",
//   "TournamentTeam"."name" as "teamName",
//   (
//     select
//       max("startTime")
//     from
//       "CalendarEventDate"
//     where
//       "eventId" = "CalendarEvent"."id"
//   ) as "startTime",
//   "TournamentResult"."isHighlight"
// from
//   "TournamentResult"
//   left join "TournamentTeam" on "TournamentTeam"."id" = "TournamentResult"."tournamentTeamId"
//   left join "CalendarEvent" on "CalendarEvent"."tournamentId" = "TournamentResult"."tournamentId"
// where
//   "TournamentResult"."userId" = @userId
// order by
//   "startTime" desc

import { ExpressionBuilder, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { dbNew } from "~/db/sql";
import { DB } from "~/db/tables";

const withMaxEventStartTime = <T extends "CalendarEvent">(
  eb: ExpressionBuilder<DB, T>,
) => {
  return eb
    .selectFrom("CalendarEventDate")
    .select(({ fn }) => [fn.max("startTime").as("startTime")])
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
      withMaxEventStartTime(eb),
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
        ])
        .where("TournamentResult.userId", "=", userId),
    )
    .orderBy("startTime", "desc");
}
