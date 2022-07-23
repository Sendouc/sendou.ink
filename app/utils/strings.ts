import type { User } from "~/db/types";

export function discordFullName(
  user: Pick<User, "discordName" | "discordDiscriminator">
) {
  return `${user.discordName}#${user.discordDiscriminator}`;
}

export function makeTitle(title: string | string[]) {
  return `${Array.isArray(title) ? title.join(" | ") : title} | sendou.ink`;
}
