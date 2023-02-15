import { z } from "zod";
import { modeShort, safeJSONParse, stageId, weaponSplId } from "~/utils/zod";
import { videoMatchTypes } from "./vods-constants";

export const videoMatchSchema = z.object({
  startsAt: z.number(),
  stageId: stageId,
  mode: modeShort,
  weapons: z.array(weaponSplId),
});

export const videoSchema = z.object({
  type: z.enum(videoMatchTypes),
  eventId: z.number().optional(),
  youtubeId: z.string(),
  title: z.string(),
  youtubeDate: z.number(),
  povUserId: z.number().optional(),
  povUserName: z.string().optional(),
  matches: z.array(videoMatchSchema),
});

export const videoInputSchema = z.object({
  video: z.preprocess(safeJSONParse, videoSchema),
});
