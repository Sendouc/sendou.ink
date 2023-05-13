import { sql } from "~/db/sql";
import type {
  CalendarEvent,
  CalendarEventDate,
  Tournament,
  User,
} from "~/db/types";

// xxx: doesn't work if many start times
const stm = sql.prepare(/*sql*/ `
select
  "Tournament"."id",
  "Tournament"."mapPickingStyle",
  "Tournament"."format",
  "Tournament"."showMapListGenerator",
  "CalendarEvent"."id" as "eventId",
  "CalendarEvent"."name",
  "CalendarEvent"."description",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."authorId",
  "CalendarEventDate"."startTime",
  "User"."discordName",
  "User"."discordDiscriminator",
  "User"."discordId"
  from "Tournament"
    left join "CalendarEvent" on "Tournament"."id" = "CalendarEvent"."tournamentId"
    left join "User" on "CalendarEvent"."authorId" = "User"."id"
    left join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
  where "Tournament"."id" = @identifier
  group by "CalendarEvent"."id"
`);

type FindByIdentifierRow =
  | ((Pick<CalendarEvent, "bracketUrl" | "name" | "description" | "authorId"> &
      Pick<
        Tournament,
        "id" | "format" | "mapPickingStyle" | "showMapListGenerator"
      > &
      Pick<User, "discordId" | "discordName" | "discordDiscriminator"> &
      Pick<CalendarEventDate, "startTime">) & { eventId: CalendarEvent["id"] })
  | null;

export function findByIdentifier(identifier: string | number) {
  const row = stm.get({ identifier }) as FindByIdentifierRow;

  if (!row) return null;

  const { discordId, discordName, discordDiscriminator, ...rest } = row;

  return {
    ...rest,
    author: {
      discordId,
      discordName,
      discordDiscriminator,
    },
  };
}
