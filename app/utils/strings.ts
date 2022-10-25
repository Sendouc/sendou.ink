import type { User } from "~/db/types";

export function discordFullName(
  user: Pick<User, "discordName" | "discordDiscriminator">
) {
  return `${user.discordName}#${user.discordDiscriminator}`;
}

export function makeTitle(title: string | string[]) {
  return `${Array.isArray(title) ? title.join(" | ") : title} | sendou.ink`;
}

export function getEnglishOrdinalSuffix(num: number) {
  const lastDigit = num % 10;
  const last2Digits = num % 100;

  if (lastDigit === 1 && last2Digits !== 11) {
    return "st";
  } else if (lastDigit === 2 && last2Digits !== 12) {
    return "nd";
  } else if (lastDigit === 3 && last2Digits !== 13) {
    return "rd";
  }
  return "th";
}

export function semiRandomId() {
  return String(Math.random());
}

export const rawSensToString = (sens: number) =>
  `${sens > 0 ? "+" : ""}${sens / 10}`;

type WithStart<
  S extends string,
  Start extends string
> = S extends `${Start}${infer Rest}` ? `${Start}${Rest}` : never;

export function startsWith<S extends string, Start extends string>(
  str: S,
  start: Start
): str is WithStart<S, Start> {
  return str.startsWith(start);
}

type Split<S extends string, Sep extends string> = string extends S
  ? string[]
  : S extends ""
  ? []
  : S extends `${infer T}${Sep}${infer U}`
  ? [T, ...Split<U, Sep>]
  : [S];

export function split<S extends string, Sep extends string>(
  str: S,
  seperator: Sep
) {
  return str.split(seperator) as Split<S, Sep>;
}
