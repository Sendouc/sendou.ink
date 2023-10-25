import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import invariant from "tiny-invariant";
import { dbNew } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

export type FindById = NonNullable<Unwrapped<typeof findById>>;
export async function findById(id: number) {
  const row = await dbNew
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
    ])
    .where("Tournament.id", "=", id)
    .executeTakeFirst();

  if (!row) return null;

  // TODO: can be made better when $narrowNotNull lands
  const author = row.author;
  invariant(author, "Tournament author is missing");

  return { ...row, author };
}
