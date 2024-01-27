import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stagesObj as s } from "~/modules/in-game-lists/stage-ids";

export const BANNED_MAPS: Record<ModeShort, StageId[]> = {
  TW: [],
  SZ: [s.SCORCH_GORGE, s.EELTAIL_ALLEY, s.HAMMERHEAD_BRIDGE],
  TC: [
    s.HAMMERHEAD_BRIDGE,
    s.WAHOO_WORLD,
    s.FLOUNDER_HEIGHTS,
    s.BRINEWATER_SPRINGS,
    s.UM_AMI_RUINS,
  ],
  RM: [
    s.EELTAIL_ALLEY,
    s.HAMMERHEAD_BRIDGE,
    s.WAHOO_WORLD,
    s.BRINEWATER_SPRINGS,
    s.UM_AMI_RUINS,
  ],
  CB: [
    s.EELTAIL_ALLEY,
    s.UNDERTOW_SPILLWAY,
    s.HAMMERHEAD_BRIDGE,
    s.STURGEON_SHIPYARD,
    s.WAHOO_WORLD,
    s.FLOUNDER_HEIGHTS,
  ],
};
