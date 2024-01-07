import { sql } from "~/db/sql";
import type { Tables } from "~/db/tables";
import type {
  CalendarEvent,
  CalendarEventDate,
  Tournament,
  User,
} from "~/db/types";

const stm = sql.prepare(/*sql*/ `
select
  "Tournament"."id",
  "Tournament"."mapPickingStyle",
  "Tournament"."bracketsStyle",
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

type FindByIdentifierRow = (Pick<
  CalendarEvent,
  "bracketUrl" | "name" | "description" | "authorId"
> &
  Pick<Tournament, "id" | "mapPickingStyle" | "showMapListGenerator"> &
  Pick<User, "discordId" | "discordName" | "discordDiscriminator"> &
  Pick<CalendarEventDate, "startTime">) & {
  eventId: CalendarEvent["id"];
} & { bracketsStyle: string };

export function findByIdentifier(identifier: string | number) {
  const rows = stm.all({ identifier }) as FindByIdentifierRow[];
  if (rows.length === 0) return null;

  const tournament = { ...rows[0], startTime: resolveEarliestStartTime(rows) };

  const { discordId, discordName, discordDiscriminator, ...rest } = tournament;

  return {
    ...rest,
    bracketsStyle: JSON.parse(
      tournament.bracketsStyle,
    ) as Tables["Tournament"]["bracketsStyle"],
    author: {
      discordId,
      discordName,
      discordDiscriminator,
    },
  };
}

function resolveEarliestStartTime(
  rows: Pick<CalendarEventDate, "startTime">[],
) {
  return Math.min(...rows.map((row) => row.startTime));
}
