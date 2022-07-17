import type { User } from "~/db/types";

export function discordFullName(
  user: Pick<User, "discordName" | "discordDiscriminator">
) {
  return `${user.discordName}#${user.discordDiscriminator}`;
}

export function makeTitle(title: string) {
  return `${title} | sendou.ink`;
}
