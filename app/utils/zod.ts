import { z } from "zod";

export const id = z.number().int().positive();

export function processMany(
  ...processFuncs: Array<(value: unknown) => unknown>
) {
  return (value: unknown) => {
    let result = value;

    for (const processFunc of processFuncs) {
      result = processFunc(result);
    }

    return result;
  };
}

export function safeJSONParse(value: unknown): unknown {
  try {
    if (typeof value !== "string") return value;
    const parsedValue = z.string().parse(value);
    return JSON.parse(parsedValue);
  } catch (e) {
    return undefined;
  }
}

export function falsyToNull(value: unknown): unknown {
  if (value) return value;

  return null;
}

export function actualNumber(value: unknown) {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}

export function date(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return value;
}

export function noDuplicates(arr: (number | string)[]) {
  return new Set(arr).size === arr.length;
}

export function removeDuplicates(value: unknown) {
  if (!Array.isArray(value)) return value;

  return Array.from(new Set(value));
}

export function toArray<T>(value: T | Array<T>) {
  if (Array.isArray(value)) return value;

  return [value];
}
