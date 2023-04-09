export function roundToNDecimalPlaces(num: number, n = 2) {
  return Number((Math.round(num * 100) / 100).toFixed(n));
}

export function cutToNDecimalPlaces(num: number, n = 2) {
  const multiplier = 10 ** n;
  const truncatedNum = Math.trunc(num * multiplier) / multiplier;
  const result = truncatedNum.toFixed(n);
  return Number(n > 0 ? result.replace(/\.?0+$/, "") : result);
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

export function sumArray(arr: number[]) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}
