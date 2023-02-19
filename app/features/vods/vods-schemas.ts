import { z } from "zod";
import { modeShort, safeJSONParse, stageId, weaponSplId } from "~/utils/zod";
import { videoMatchTypes, VOD } from "./vods-constants";

export const videoMatchSchema = z.object({
  startsAt: z.number(),
  stageId: stageId,
  mode: modeShort,
  weapons: z.array(weaponSplId),
});

export const videoSchema = z
  .object({
    type: z.enum(videoMatchTypes),
    eventId: z.number().optional(),
    youtubeId: z.string(),
    title: z.string().min(VOD.TITLE_MIN_LENGTH).max(VOD.TITLE_MAX_LENGTH),
    youtubeDate: z.number(),
    povUserId: z.number().optional(),
    povUserName: z
      .string()
      .min(VOD.PLAYER_NAME_MIN_LENGTH)
      .max(VOD.PLAYER_NAME_MAX_LENGTH)
      .optional(),
    matches: z.array(videoMatchSchema),
  })
  .refine((data) => {
    if (
      data.type === "CAST" &&
      data.matches.some((match) => match.weapons.length !== 8)
    ) {
      return [false, { message: "CAST matches must have 8 weapons" }];
    }

    if (
      data.type !== "CAST" &&
      data.matches.some((match) => match.weapons.length !== 1)
    ) {
      return [false, { message: "Non-CAST matches must have 1 weapon" }];
    }

    if (!data.povUserId && !data.povUserName) {
      return [
        false,
        { message: "Either povUserId or povUserName must be provided" },
      ];
    }

    return true;
  });

export const videoInputSchema = z.object({
  video: z.preprocess(safeJSONParse, videoSchema),
});
