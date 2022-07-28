import { getWeek } from "date-fns";

export function databaseTimestampToDate(timestamp: number) {
  return new Date(timestamp * 1000);
}

export function dateToDatabaseTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export function dateToWeekNumber(date: Date) {
  return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
}

// https://stackoverflow.com/a/71336659
export function weekNumberToDate({
  week,
  year,
  position = "start",
}: {
  week: number;
  year: number;
  /** start = Date of Monday, end = Date of Sunday */
  position?: "start" | "end";
}) {
  const result = new Date(Date.UTC(year, 0, 4));

  result.setDate(
    result.getDate() - (result.getDay() || 7) + 1 + 7 * (week - 1)
  );
  if (position === "end") {
    result.setDate(result.getDate() + 6);
  }
  return result;
}
