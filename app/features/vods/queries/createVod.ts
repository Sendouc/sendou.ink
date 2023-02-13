import { sql } from "~/db/sql";
import type { VideoBeingAdded } from "../vods-types";

const createVideoStm = sql.prepare(/* sql */ `
  insert into "Video"
    ("title", "type", "youtubeDate", "eventId", "youtubeId", "submitterUserId")
  values
    (@title, @type, @youtubeDate, @eventId, @youtubeId, @submitterUserId)
  returning *
`);

const createVideoMatchStm = sql.prepare(/* sql */ `
  insert into "VideoMatch"
    ("videoId", "startsAt", "stageId", "mode")
  values
    (@videoId, @startsAt, @stageId, @mode)
  returning *
`);

const createVideoMatchPlayerStm = sql.prepare(/* sql */ `
  insert into "VideoMatchPlayer"
    ("videoMatchId", "playerUserId", "playerName", "weaponSplId", "player")
  values
    (@videoMatchId, @playerUserId, @playerName, @weaponSplId, @player)
`);

export const createVod = sql.transaction(
  (args: VideoBeingAdded & { submitterUserId: number }) => {
    const video = createVideoStm.get({
      title: args.title,
      type: args.type,
      youtubeDate: args.youtubeDate,
      eventId: args.eventId,
      youtubeId: args.youtubeId,
      submitterUserId: args.submitterUserId,
    });

    for (const match of args.matches) {
      const videoMatch = createVideoMatchStm.get({
        videoId: video.id,
        startsAt: match.startsAt,
        stageId: match.stageId,
        mode: match.mode,
      });

      for (const [i, weaponSplId] of match.weapons.entries()) {
        createVideoMatchPlayerStm.run({
          videoMatchId: videoMatch.id,
          playerUserId: args.povUserId,
          playerName: args.povUserName,
          weaponSplId,
          player: i + 1,
        });
      }
    }
  }
);
