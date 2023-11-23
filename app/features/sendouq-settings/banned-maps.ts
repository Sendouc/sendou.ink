import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stagesObj as s } from "~/modules/in-game-lists/stage-ids";

export const COMMON_BANNED_MAPS = [
  s.HAMMERHEAD_BRIDGE,
  s.WAHOO_WORLD,
  s.MINCEMEAT_METALWORKS,
  s.EELTAIL_ALLEY,
];
export const BANNED_MAPS: Record<ModeShort, StageId[]> = {
  TW: [...COMMON_BANNED_MAPS],
  SZ: [...COMMON_BANNED_MAPS],
  TC: [...COMMON_BANNED_MAPS, s.BRINEWATER_SPRINGS, s.FLOUNDER_HEIGHTS],
  RM: [...COMMON_BANNED_MAPS, s.BRINEWATER_SPRINGS, s.UM_AMI_RUINS],
  CB: [...COMMON_BANNED_MAPS, s.STURGEON_SHIPYARD, s.FLOUNDER_HEIGHTS],
};
