import type { z } from "zod";
import type { User, Video, VideoMatch } from "~/db/types";
import type { MainWeaponId } from "~/modules/in-game-lists";
import type { videoMatchSchema, videoSchema } from "./vods-schemas";

export type VideoBeingAddedPartial = Partial<VideoBeingAdded>;

export type VideoBeingAdded = z.infer<typeof videoSchema>;

export type VideoMatchBeingAdded = z.infer<typeof videoMatchSchema>;

export interface Vod {
  id: Video["id"];
  pov?:
    | Pick<
        User,
        "discordName" | "discordId" | "discordAvatar" | "discordDiscriminator"
      >
    | string;
  title: Video["title"];
  youtubeDate: Video["youtubeDate"];
  youtubeId: Video["youtubeId"];
  matches: Array<VodMatch>;
}

export type VodMatch = Pick<
  VideoMatch,
  "id" | "mode" | "stageId" | "startsAt"
> & {
  weapons: Array<MainWeaponId>;
};
