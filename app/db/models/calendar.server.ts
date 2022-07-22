import { dateToDatabaseTimestamp } from "~/utils/dates";
import { sql } from "../sql";
import type { CalendarEvent, CalendarEventDate } from "../types";

const findAllBetweenTwoTimestampsStm = sql.prepare(`
  select 
      "CalendarEvent"."name",
      "CalendarEvent"."discordUrl",
      "CalendarEvent"."bracketUrl",
      "CalendarEventDate"."id",
      "CalendarEventDate"."startTime"
    from "CalendarEvent"
    join "CalendarEventDate" on "CalendarEvent"."id" = "CalendarEventDate"."eventId"
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
  return findAllBetweenTwoTimestampsStm.all({
    startTime: dateToDatabaseTimestamp(startTime),
    endTime: dateToDatabaseTimestamp(endTime),
  }) as Array<
    Pick<CalendarEvent, "name" | "discordUrl" | "bracketUrl"> &
      Pick<CalendarEventDate, "id" | "startTime">
  >;
}
