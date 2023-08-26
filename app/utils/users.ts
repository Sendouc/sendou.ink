import type { User } from "~/db/types";
import { isAdmin } from "~/permissions";
import { isCustomUrl } from "./urls";

export function isAtLeastFiveDollarTierPatreon(
  user?: Pick<User, "patronTier" | "id">
) {
  if (!user) return false;

  return isAdmin(user) || (user.patronTier && user.patronTier >= 2);
}

const urlRegExp = new RegExp("(https://)?sendou.ink/u/(.+)");
const DISCORD_ID_MIN_LENGTH = 17;
export function queryToUserIdentifier(
  query: string
): { id: number } | { discordId: string } | { customUrl: string } | null {
  const match = query.match(urlRegExp);

  if (match) {
    const [, , identifier] = match;

    if (isCustomUrl(identifier)) {
      return { customUrl: identifier };
    }

    return { discordId: identifier };
  }

  // = it's numeric
  if (!isCustomUrl(query)) {
    if (query.length >= DISCORD_ID_MIN_LENGTH) {
      return { discordId: query };
    }

    return { id: Number(query) };
  }

  return null;
}
