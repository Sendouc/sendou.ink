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
