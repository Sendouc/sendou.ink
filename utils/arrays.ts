export const shuffleArray = <T>(array: T[]) => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};

/**
 * Get random element from array.
 * @link https://stackoverflow.com/a/5915122
 * @example
 * randomElement(["dog", "cat", "horse"])
 */
export const randomElement = <T>(items: [T, ...T[]]) => {
  return items[Math.floor(Math.random() * items.length)];
};
