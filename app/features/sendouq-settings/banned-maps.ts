import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stagesObj as s } from "~/modules/in-game-lists/stage-ids";

export const COMMON_BANNED_MAPS = [s.HAMMERHEAD_BRIDGE];
export const BANNED_MAPS: Record<ModeShort, StageId[]> = {
  TW: [...COMMON_BANNED_MAPS, s.WAHOO_WORLD],
  SZ: [
    ...COMMON_BANNED_MAPS,
    s.SCORCH_GORGE,
    s.EELTAIL_ALLEY,
    s.MINCEMEAT_METALWORKS,
  ],
  TC: [
    ...COMMON_BANNED_MAPS,
    s.WAHOO_WORLD,
    s.BRINEWATER_SPRINGS,
    s.FLOUNDER_HEIGHTS,
    s.UM_AMI_RUINS,
    s.MINCEMEAT_METALWORKS,
  ],
  RM: [
    ...COMMON_BANNED_MAPS,
    s.WAHOO_WORLD,
    s.BRINEWATER_SPRINGS,
    s.UM_AMI_RUINS,
    s.EELTAIL_ALLEY,
    s.MINCEMEAT_METALWORKS,
  ],
  CB: [
    ...COMMON_BANNED_MAPS,
    s.WAHOO_WORLD,
    s.STURGEON_SHIPYARD,
    s.FLOUNDER_HEIGHTS,
    s.EELTAIL_ALLEY,
    s.MINCEMEAT_METALWORKS,
    s.UNDERTOW_SPILLWAY,
  ],
};
