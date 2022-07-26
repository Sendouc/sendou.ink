import { dateToDatabaseTimestamp } from "~/utils/dates";
import { sql } from "../sql";
import type { CalendarEvent, CalendarEventDate, User } from "../types";

const findAllBetweenTwoTimestampsStm = sql.prepare(`
  select
      "CalendarEvent"."name",
      "CalendarEvent"."discordUrl",
      "CalendarEvent"."bracketUrl",
      "CalendarEventDate"."id",
      "CalendarEventDate"."eventId",
      "CalendarEventDate"."startTime",
      "User"."discordName",
      "User"."discordDiscriminator"
    from "CalendarEvent"
    join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
    join "User" on "CalendarEvent"."authorId" = "User"."id"
    where "CalendarEventDate"."startTime" between $startTime and $endTime
    order by "CalendarEventDate"."startTime" asc
`);

export function findAllBetweenTwoTimestamps({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const rows = findAllBetweenTwoTimestampsStm.all({
    startTime: dateToDatabaseTimestamp(startTime),
    endTime: dateToDatabaseTimestamp(endTime),
  }) as Array<
    Pick<CalendarEvent, "name" | "discordUrl" | "bracketUrl"> &
      Pick<CalendarEventDate, "id" | "eventId" | "startTime"> &
      Pick<User, "discordName" | "discordDiscriminator">
  >;

  const eventsSeen = new Map<CalendarEventDate["eventId"], number>();
  return rows.map((row) => {
    const eventsSoFar = (eventsSeen.get(row.eventId) ?? 0) + 1;
    eventsSeen.set(row.eventId, eventsSoFar);

    return { ...row, nthAppearance: eventsSoFar > 1 ? eventsSoFar : undefined };
  });
}

const findByIdStm = sql.prepare(`
  select
    "CalendarEvent"."name",
    "CalendarEvent"."description",
    "CalendarEvent"."discordUrl",
    "CalendarEvent"."bracketUrl",
    "CalendarEventDate"."startTime",
    "CalendarEventDate"."eventId",
    "User"."discordName",
    "User"."discordDiscriminator",
    "User"."discordId",
    "User"."discordAvatar"
  from "CalendarEvent"
  join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
  join "User" on "CalendarEvent"."authorId" = "User"."id"
  where "CalendarEvent"."id" = $id
  order by "CalendarEventDate"."startTime" asc
`);

export function findById(id: CalendarEvent["id"]) {
  const rows = findByIdStm.all({ id }) as Array<
    Pick<CalendarEvent, "name" | "description" | "discordUrl" | "bracketUrl"> &
      Pick<CalendarEventDate, "startTime" | "eventId"> &
      Pick<
        User,
        "discordName" | "discordDiscriminator" | "discordId" | "discordAvatar"
      >
  >;

  if (rows.length === 0) return null;

  return {
    ...rows[0],
    startTimes: rows.map((row) => row.startTime),
    startTime: undefined,
  };
}

const startTimesOfRangeStm = sql.prepare(`
  select
    "CalendarEventDate"."startTime"
  from "CalendarEventDate"
  where "CalendarEventDate"."startTime" between $startTime and $endTime
`);

export function startTimesOfRange({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  return (
    startTimesOfRangeStm.all({
      startTime: dateToDatabaseTimestamp(startTime),
      endTime: dateToDatabaseTimestamp(endTime),
    }) as Array<Pick<CalendarEventDate, "startTime">>
  ).map(({ startTime }) => startTime);
}
