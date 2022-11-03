import { getWeek } from "date-fns";

export function databaseTimestampToDate(timestamp: number) {
  return new Date(timestamp * 1000);
}

export function dateToDatabaseTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export function databaseCreatedAt() {
  return dateToDatabaseTimestamp(new Date());
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

/** Returns date as a string with the format YYYY-MM-DDThh:mm in user's time zone */
export function dateToYearMonthDayHourMinuteString(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${year}-${prefixZero(month)}-${prefixZero(day)}T${prefixZero(
    hour
  )}:${prefixZero(minute)}`;
}

function prefixZero(number: number) {
  return number < 10 ? `0${number}` : number;
}
