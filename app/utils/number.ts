export function roundToNDecimalPlaces(num: number, n = 2) {
  return Number((Math.round(num * 100) / 100).toFixed(n));
}
