import { ADMIN_UUID } from "~/constants";

export function isAdmin(userId?: string) {
  return userId === ADMIN_UUID;
}
