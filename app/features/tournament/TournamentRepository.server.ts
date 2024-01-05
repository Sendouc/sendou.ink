import type { NotNull } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

export type FindById = NonNullable<Unwrapped<typeof findById>>;
export async function findById(id: number) {
  const row = await db
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
      "Tournament.mapPickingStyle",
      "Tournament.format",
      "Tournament.showMapListGenerator",
      "CalendarEvent.id as eventId",
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEvent.bracketUrl",
      "CalendarEventDate.startTime",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .whereRef("CalendarEvent.authorId", "=", "User.id")
          .select(COMMON_USER_FIELDS),
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
          .leftJoin("User", "TournamentStaff.userId", "User.id")
          .select([...COMMON_USER_FIELDS, "TournamentStaff.role"])
          .where("TournamentStaff.tournamentId", "=", id),
      ).as("staff"),
    ])
    .where("Tournament.id", "=", id)
    .$narrowType<{ author: NotNull }>()
    .executeTakeFirst();

  if (!row) return null;

  return row;
}
