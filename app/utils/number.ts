export function roundToNDecimalPlaces(num: number, n = 2) {
  return Number((Math.round(num * 100) / 100).toFixed(n));
}

export function secondsToMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  return `${minutes}:${secondsLeft.toString().padStart(2, "0")}`;
}

export function secondsToMinutesNumberTuple(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  return [minutes, secondsLeft] as const;
}
