import { z } from "zod";
import { languagesUnified } from "~/modules/i18n/config";
import {
  _action,
  modeShort,
  noDuplicates,
  safeJSONParse,
  stageId,
  weaponSplId,
} from "~/utils/zod";
import { SENDOUQ_WEAPON_POOL_MAX_SIZE } from "./q-settings-constants";

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
    _action: _action("UPDATE_VC"),
    vc: z.enum(["YES", "NO", "LISTEN_ONLY"]),
    languages: z.preprocess(
      safeJSONParse,
      z
        .array(z.string())
        .refine(noDuplicates)
        .refine((val) =>
          val.every((lang) => languagesUnified.some((l) => l.code === lang)),
        ),
    ),
  }),
  z.object({
    _action: _action("UPDATE_SENDOUQ_WEAPON_POOL"),
    weaponPool: z.preprocess(
      safeJSONParse,
      z.array(weaponSplId).max(SENDOUQ_WEAPON_POOL_MAX_SIZE),
    ),
  }),
]);
