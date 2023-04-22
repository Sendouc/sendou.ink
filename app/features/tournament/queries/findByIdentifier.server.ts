import { sql } from "~/db/sql";
import type { CalendarEvent, CalendarEventDate, User } from "~/db/types";

// TODO: doesn't work if many start times
const stm = sql.prepare(/*sql*/ `
  select
  "CalendarEvent"."name",
  "CalendarEvent"."description",
  "CalendarEvent"."id",
  "CalendarEvent"."bracketUrl",
  "CalendarEvent"."authorId",
  "CalendarEvent"."isBeforeStart",
  "CalendarEvent"."toToolsMode",
  "CalendarEventDate"."startTime",
  "User"."discordName",
  "User"."discordDiscriminator",
  "User"."discordId"
  from "CalendarEvent"
    left join "User" on "CalendarEvent"."authorId" = "User"."id"
    left join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
  where
  (
    "CalendarEvent"."id" = @identifier
    or "CalendarEvent"."customUrl" = @identifier
  )
  and "CalendarEvent"."toToolsEnabled" = 1
  group by "CalendarEvent"."id"
`);

type FindByIdentifierRow =
  | (Pick<
      CalendarEvent,
      | "bracketUrl"
      | "id"
      | "name"
      | "description"
      | "authorId"
      | "isBeforeStart"
      | "toToolsMode"
    > &
      Pick<User, "discordId" | "discordName" | "discordDiscriminator"> &
      Pick<CalendarEventDate, "startTime">)
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
