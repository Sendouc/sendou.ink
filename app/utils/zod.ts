import { z } from "zod";

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
