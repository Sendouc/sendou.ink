import { dateToDatabaseTimestamp } from "~/utils/dates";
import { sql } from "../sql";
import type { CalendarEvent, CalendarEventDate, User } from "../types";

// xxx: TODO: add tags
const findAllBetweenTwoTimestampsStm = sql.prepare(`
  select
    "CalendarEvent"."name",
    "CalendarEvent"."discordUrl",
    "CalendarEvent"."bracketUrl",
    "CalendarEventDate"."id",
    "CalendarEventDate"."eventId",
    "CalendarEventDate"."startTime",
    "User"."discordName",
    "User"."discordDiscriminator",
    "CalendarEventRanks"."nthAppearance",
    exists (select 1 
      from "CalendarEventBadge" 
      where "badgeId" = "CalendarEventDate"."eventId"
    ) as "hasBadge"
    from "CalendarEvent"
    join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
    join "User" on "CalendarEvent"."authorId" = "User"."id"
    join (
      select 
        "id", 
        "eventId", 
        "startTime", 
        rank() over(partition by "eventId" order by "startTime" asc) "nthAppearance" 
      from "CalendarEventDate"
    ) "CalendarEventRanks" on "CalendarEventDate"."id" = CalendarEventRanks."id"
    where "CalendarEventDate"."startTime" between $startTime and $endTime
    order by "CalendarEventDate"."startTime" asc
`);

function addTagArray<
  T extends { hasBadge: number; tags?: CalendarEvent["tags"] }
>(arg: T) {
  const { hasBadge, ...row } = arg;
  const tags = (row.tags ? row.tags.split(",") : []) as Array<"BADGE_PRIZE">;

  if (hasBadge) tags.push("BADGE_PRIZE");

  return { ...row, tags };
}

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
    Pick<CalendarEvent, "name" | "discordUrl" | "bracketUrl" | "tags"> &
      Pick<CalendarEventDate, "id" | "eventId" | "startTime"> &
      Pick<User, "discordName" | "discordDiscriminator"> & {
        nthAppearance: number;
      } & { hasBadge: number }
  >;

  return rows.map(addTagArray);
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
  const [firstRow, ...rest] = findByIdStm.all({ id }) as Array<
    Pick<CalendarEvent, "name" | "description" | "discordUrl" | "bracketUrl"> &
      Pick<CalendarEventDate, "startTime" | "eventId"> &
      Pick<
        User,
        "discordName" | "discordDiscriminator" | "discordId" | "discordAvatar"
      >
  >;

  if (!firstRow) return null;

  return {
    ...firstRow,
    startTimes: [firstRow, ...rest].map((row) => row.startTime),
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
