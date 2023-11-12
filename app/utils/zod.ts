import type { ZodType } from "zod";
import { z } from "zod";
import type { abilitiesShort } from "~/modules/in-game-lists";
import { abilities, mainWeaponIds, stageIds } from "~/modules/in-game-lists";
import type { Unpacked } from "./types";
import { assertType } from "./types";

export const id = z.coerce.number().int().positive();
export const dbBoolean = z.coerce.number().min(0).max(1).int();

const abilityNameToType = (val: string) =>
  abilities.find((ability) => ability.name === val)?.type;
export const headMainSlotAbility = z
  .string()
  .refine((val) =>
    ["STACKABLE", "HEAD_MAIN_ONLY"].includes(abilityNameToType(val) as any),
  );
export const clothesMainSlotAbility = z
  .string()
  .refine((val) =>
    ["STACKABLE", "CLOTHES_MAIN_ONLY"].includes(abilityNameToType(val) as any),
  );
export const shoesMainSlotAbility = z
  .string()
  .refine((val) =>
    ["STACKABLE", "SHOES_MAIN_ONLY"].includes(abilityNameToType(val) as any),
  );
export const stackableAbility = z
  .string()
  .refine((val) => abilityNameToType(val) === "STACKABLE");

export const ability = z.enum([
  "ISM",
  "ISS",
  "IRU",
  "RSU",
  "SSU",
  "SCU",
  "SS",
  "SPU",
  "QR",
  "QSJ",
  "BRU",
  "RES",
  "SRU",
  "IA",
  "OG",
  "LDE",
  "T",
  "CB",
  "NS",
  "H",
  "TI",
  "RP",
  "AD",
  "SJ",
  "OS",
  "DR",
]);
// keep in-game-lists and the zod enum in sync
assertType<z.infer<typeof ability>, Unpacked<typeof abilitiesShort>>();

export const weaponSplId = z.preprocess(
  actualNumber,
  z
    .number()
    .refine((val) =>
      mainWeaponIds.includes(val as (typeof mainWeaponIds)[number]),
    ),
);

export const modeShort = z.enum(["TW", "SZ", "TC", "RM", "CB"]);

export const stageId = z.preprocess(actualNumber, numericEnum(stageIds));

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

export function jsonParseable(value: unknown) {
  try {
    JSON.parse(value as string);
    return true;
  } catch {
    return false;
  }
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

export function checkboxValueToDbBoolean(value: unknown) {
  if (checkboxValueToBoolean(value)) return 1;

  return 0;
}

export const _action = <T extends z.Primitive>(value: T) =>
  z.preprocess(deduplicate, z.literal(value));

// Fix bug at least in Safari 15 where SubmitButton value might get sent twice
export function deduplicate(value: unknown) {
  if (Array.isArray(value)) {
    const [one, two, ...rest] = value;
    if (rest.length > 0) return value;
    if (one !== two) return value;

    return one;
  }

  return value;
}

// https://github.com/colinhacks/zod/issues/1118#issuecomment-1235065111
export function numericEnum<TValues extends readonly number[]>(
  values: TValues,
) {
  return z.number().superRefine((val, ctx) => {
    if (!values.includes(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_enum_value,
        options: [...values],
        received: val,
      });
    }
  }) as ZodType<TValues[number]>;
}
