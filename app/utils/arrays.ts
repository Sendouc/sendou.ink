// xxx: should instead take array of functions to improve efficiency (not run them all if not necessary)
export function allTruthy(arr: unknown[]) {
  return arr.every(Boolean);
}
