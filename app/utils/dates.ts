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

/**
 * Checks if a date is valid or not.
 *
 * Returns:
 * - True if date is valid
 * - False otherwise
 */
export function isValidDate(date: Date) {
  return !isNaN(date.getTime());
}

/** Returns date as a string with the format YYYY-MM-DDThh:mm in user's time zone */
export function dateToYearMonthDayHourMinuteString(date: Date) {
  const copiedDate = new Date(date.getTime());

  if (!isValidDate(copiedDate)) {
    throw new Error("tried to format string from invalid date");
  }

  const year = copiedDate.getFullYear();
  const month = copiedDate.getMonth() + 1;
  const day = copiedDate.getDate();
  const hour = copiedDate.getHours();
  const minute = copiedDate.getMinutes();

  return `${year}-${prefixZero(month)}-${prefixZero(day)}T${prefixZero(
    hour
  )}:${prefixZero(minute)}`;
}

function prefixZero(number: number) {
  return number < 10 ? `0${number}` : number;
}

/**
 * Retrieves a new Date object that is offset by several hours.
 *
 * NOTE: it is important that we work with & return a copy of the date here,
 *  otherwise we will just be mutating the original date passed into this function.
 */
export function getDateWithHoursOffset(date: Date, hoursOffset: number) {
  const copiedDate = new Date(date.getTime());
  copiedDate.setHours(date.getHours() + hoursOffset);
  return copiedDate;
}
