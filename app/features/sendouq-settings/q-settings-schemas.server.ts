import { z } from "zod";
import { _action, modeShort, safeJSONParse, stageId } from "~/utils/zod";

const preference = z.enum(["AVOID", "PREFER"]);
export const settingsActionSchema = z.union([
  z.object({
    _action: _action("UPDATE_MAP_MODE_PREFERENCES"),
    mapModePreferences: z.preprocess(
      safeJSONParse,
      z.object({
        modes: z.array(z.object({ mode: modeShort, preference })),
        maps: z.array(z.object({ stageId, mode: modeShort, preference })),
      }),
    ),
  }),
  z.object({
    _action: _action("PLACEHOLDER"),
  }),
]);
