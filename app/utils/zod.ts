import { z } from "zod";
import { abilities } from "~/modules/in-game-lists";

export const id = z.number().int().positive();

const abilityNameToType = (val: string) =>
  abilities.find((ability) => ability.name === val)?.type;
export const headMainSlotAbility = z
  .string()
  .refine((val) =>
    ["STACKABLE", "HEAD_MAIN_ONLY"].includes(abilityNameToType(val) as any)
  );
export const clothesMainSlotAbility = z
  .string()
  .refine((val) =>
    ["STACKABLE", "CLOTHES_MAIN_ONLY"].includes(abilityNameToType(val) as any)
  );
export const shoesMainSlotAbility = z
  .string()
  .refine((val) =>
    ["STACKABLE", "SHOES_MAIN_ONLY"].includes(abilityNameToType(val) as any)
  );
export const stackableAbility = z
  .string()
  .refine((val) => abilityNameToType(val) === "STACKABLE");

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

export function undefinedToNull(value: unknown): unknown {
  if (value === undefined) return null;

  return value;
}

export function actualNumber(value: unknown) {
  if (value === "") return undefined;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}

export function trimmedString(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("Expected string value");
  }

  return value.trim();
}

export function date(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    const valueAsNumber = Number(value);

    return new Date(Number.isNaN(valueAsNumber) ? value : valueAsNumber);
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

export function checkboxValueToBoolean(value: unknown) {
  if (!value) return false;

  if (typeof value !== "string") {
    throw new Error("Expected string checkbox value");
  }

  return value === "on";
}
