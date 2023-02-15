import type { User } from "~/db/types";
import { isAdmin } from "~/permissions";

export function isAtLeastFiveDollarTierPatreon(
  user?: Pick<User, "patronTier" | "id">
) {
  if (!user) return false;

  return isAdmin(user) || (user.patronTier && user.patronTier >= 2);
}
