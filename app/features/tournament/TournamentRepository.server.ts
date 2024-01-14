import type { NotNull } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { Tables } from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS, userChatNameColor } from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

export type FindById = NonNullable<Unwrapped<typeof findById>>;
export async function findById(id: number) {
  const row = await db
    .selectFrom("Tournament")
    .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select(({ eb }) => [
      "Tournament.id",
      "Tournament.mapPickingStyle",
      "Tournament.bracketsStyle",
      "Tournament.showMapListGenerator",
      "Tournament.castTwitchAccounts",
      "CalendarEvent.id as eventId",
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEvent.bracketUrl",
      "CalendarEventDate.startTime",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .whereRef("CalendarEvent.authorId", "=", "User.id")
          .select([...COMMON_USER_FIELDS, userChatNameColor]),
      ).as("author"),
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .whereRef(
            "MapPoolMap.tieBreakerCalendarEventId",
            "=",
            "CalendarEvent.id",
          )
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"]),
      ).as("tieBreakerMapPool"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStaff")
          .innerJoin("User", "TournamentStaff.userId", "User.id")
          .select([
            ...COMMON_USER_FIELDS,
            userChatNameColor,
            "TournamentStaff.role",
          ])
          .where("TournamentStaff.tournamentId", "=", id),
      ).as("staff"),
    ])
    .where("Tournament.id", "=", id)
    .$narrowType<{ author: NotNull }>()
    .executeTakeFirst();

  if (!row) return null;

  return row;
}

export type FindBracketProgressionByTournamentIdItem = Unwrapped<
  typeof findBracketProgressionByTournamentId
>;
export function findBracketProgressionByTournamentId(tournamentId: number) {
  return (
    db
      .selectFrom("Tournament")
      .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
      // TODO: it does not support multiple dates
      .innerJoin(
        "CalendarEventDate",
        "CalendarEvent.id",
        "CalendarEventDate.eventId",
      )
      .select(({ eb }) => [
        "Tournament.id",
        "Tournament.bracketsStyle",
        "CalendarEventDate.startTime",
        jsonArrayFrom(
          eb
            .selectFrom("TournamentStage")
            .select([
              "TournamentStage.id",
              "TournamentStage.number",
              "TournamentStage.name",
            ])
            .whereRef("Tournament.id", "=", "TournamentStage.tournamentId"),
        ).as("stages"),
      ])
      .where("Tournament.id", "=", tournamentId)
      .executeTakeFirstOrThrow()
  );
}

export function checkedInTournamentTeamsByBracket({
  tournamentId,
  bracketIdx,
}: {
  tournamentId: number;
  bracketIdx: number;
}) {
  return db
    .selectFrom("TournamentTeamCheckIn")
    .innerJoin(
      "TournamentTeam",
      "TournamentTeamCheckIn.tournamentTeamId",
      "TournamentTeam.id",
    )
    .select(["TournamentTeamCheckIn.tournamentTeamId"])
    .where("TournamentTeamCheckIn.bracketIdx", "=", bracketIdx)
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .execute();
}

export function checkInToBracket({
  tournamentTeamId,
  bracketIdx,
}: {
  tournamentTeamId: number;
  bracketIdx: number;
}) {
  return db
    .insertInto("TournamentTeamCheckIn")
    .values({
      checkedInAt: dateToDatabaseTimestamp(new Date()),
      tournamentTeamId,
      bracketIdx,
    })
    .execute();
}

export function addStaff({
  tournamentId,
  userId,
  role,
}: {
  tournamentId: number;
  userId: number;
  role: Tables["TournamentStaff"]["role"];
}) {
  return db
    .insertInto("TournamentStaff")
    .values({
      tournamentId,
      userId,
      role,
    })
    .execute();
}

export function removeStaff({
  tournamentId,
  userId,
}: {
  tournamentId: number;
  userId: number;
}) {
  return db
    .deleteFrom("TournamentStaff")
    .where("tournamentId", "=", tournamentId)
    .where("userId", "=", userId)
    .execute();
}

export function updateCastTwitchAccounts({
  tournamentId,
  castTwitchAccounts,
}: {
  tournamentId: number;
  castTwitchAccounts: string[];
}) {
  return db
    .updateTable("Tournament")
    .set({
      castTwitchAccounts: JSON.stringify(castTwitchAccounts),
    })
    .where("id", "=", tournamentId)
    .execute();
}
