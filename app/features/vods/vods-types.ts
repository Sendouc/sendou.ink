import type { Video, VideoMatch } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";

export interface VideoBeingAdded {
  type: Video["type"];
  eventId?: Video["eventId"];
  youtubeId?: Video["youtubeId"];
  povUserId?: number;
  povUserName?: string;
  matches: Array<VideoMatchBeingAdded>;
}

export interface VideoMatchBeingAdded {
  startsAt?: VideoMatch["startsAt"];
  stageId?: VideoMatch["stageId"];
  mode?: VideoMatch["mode"];
  weapons: Array<MainWeaponId>;
}
