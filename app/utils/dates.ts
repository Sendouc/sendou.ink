export function databaseTimestampToDate(timestamp: number) {
  return new Date(timestamp * 1000);
}
