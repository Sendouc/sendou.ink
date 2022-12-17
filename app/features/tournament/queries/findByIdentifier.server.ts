import { sql } from "~/db/sql";
import type { CalendarEvent, User } from "~/db/types";

const findByIdentifierStm = sql.prepare(/*sql*/ `
  select
  "CalendarEvent"."name",
  "CalendarEvent"."description",
    "CalendarEvent"."id",
    "CalendarEvent"."bracketUrl",
    "CalendarEvent"."authorId",
    "User"."discordName",
    "User"."discordDiscriminator",
    "User"."discordId"
  from "CalendarEvent"
    left join "User" on "CalendarEvent"."authorId" = "User"."id"
  where
  (
    "CalendarEvent"."id" = @identifier
    or "CalendarEvent"."customUrl" = @identifier
  )
  and "CalendarEvent"."toToolsEnabled" = 1
`);

type FindByIdentifierRow =
  | (Pick<
      CalendarEvent,
      "bracketUrl" | "id" | "name" | "description" | "authorId"
    > &
      Pick<User, "discordId" | "discordName" | "discordDiscriminator">)
  | null;

export function findByIdentifier(identifier: string | number) {
  const row = findByIdentifierStm.get({ identifier }) as FindByIdentifierRow;

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
