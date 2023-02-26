import type { User } from "~/db/types";

export function canAddVideo(user: Pick<User, "isVideoAdder">) {
  return user.isVideoAdder;
}
