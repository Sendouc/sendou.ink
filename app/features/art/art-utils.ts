import type { User } from "~/db/types";

export function temporaryCanAccessArtCheck(user?: Pick<User, "isArtist">) {
  return user?.isArtist === 1;
}
