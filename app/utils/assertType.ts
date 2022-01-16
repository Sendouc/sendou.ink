/** @link https://stackoverflow.com/a/69413184 */
// @ts-expect-error helper to assert type to be another compile time
export const assertType = <A, B extends A>() => {}; // eslint-disable-line
