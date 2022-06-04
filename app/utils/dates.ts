export function databaseTimestampToDate(timestamp: number) {
  return new Date(timestamp * 1000);
}

export function dateToDatabaseTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
