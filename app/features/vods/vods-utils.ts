import type { User } from "~/db/types";
import { isAdmin } from "~/permissions";
import { type VideoBeingAdded, type Vod } from "./vods-types";

export function canAddVideo(user: Pick<User, "isVideoAdder">) {
  return user.isVideoAdder;
}

export function vodToVideoBeingAdded(vod: Vod): VideoBeingAdded {
  return {
    title: vod.title,
    youtubeId: vod.youtubeId,
    youtubeDate: vod.youtubeDate,
    matches: vod.matches,
    type: vod.type,
    povUserId: typeof vod.pov === "string" ? undefined : vod.pov?.id,
    povUserName: typeof vod.pov === "string" ? vod.pov : undefined,
  };
}

export function canEditVideo({
  userId,
  submitterUserId,
  povUserId,
}: {
  userId?: User["id"];
  submitterUserId: User["id"];
  povUserId?: User["id"];
}) {
  if (!userId) return false;

  return (
    isAdmin({ id: userId }) ||
    userId === submitterUserId ||
    userId === povUserId
  );
}
