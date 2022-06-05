export function roundToTwoDecimalPlaces(num: number) {
  return Number((Math.round(num * 100) / 100).toFixed(2));
}
