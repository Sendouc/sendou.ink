// xxx: should instead take array of functions to improve efficiency (not run them all if not necessary)
export function allTruthy(arr: unknown[]) {
  return arr.every(Boolean);
}

/** Mimics Array.prototype.at except throws an error if index out of bounds */
export function atOrError<T>(arr: T[], n: number) {
  const result = at(arr, n);
  if (result === undefined) {
    throw new Error(`Index ${n} out of bounds. Array length is ${arr.length}`);
  }
  return result;
}

// https://github.com/tc39/proposal-relative-indexing-method#polyfill
/** Array.at polyfill */
function at<T>(arr: T[], n: number) {
  // ToInteger() abstract op
  n = Math.trunc(n) || 0;
  // Allow negative indexing from the end
  if (n < 0) n += arr.length;
  // OOB access is guaranteed to return undefined
  if (n < 0 || n >= arr.length) return undefined;
  // Otherwise, this is just normal property access
  return arr[n];
}
