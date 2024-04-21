import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stagesObj as s } from "~/modules/in-game-lists/stage-ids";

export const BANNED_MAPS: Record<ModeShort, StageId[]> = {
  TW: [],
  SZ: [],
  TC: [
    s.HAMMERHEAD_BRIDGE,
    s.WAHOO_WORLD,
    s.FLOUNDER_HEIGHTS,
    s.BRINEWATER_SPRINGS,
    s.UM_AMI_RUINS,
    s.SCORCH_GORGE,
    s.MAHI_MAHI_RESORT,
    s.BARNACLE_AND_DIME,
  ],
  RM: [
    s.EELTAIL_ALLEY,
    s.HAMMERHEAD_BRIDGE,
    s.WAHOO_WORLD,
    s.BRINEWATER_SPRINGS,
    s.UM_AMI_RUINS,
    s.BLUEFIN_DEPOT,
    s.STURGEON_SHIPYARD,
    s.INKBLOT_ART_ACADEMY,
  ],
  CB: [
    s.HAMMERHEAD_BRIDGE,
    s.STURGEON_SHIPYARD,
    s.WAHOO_WORLD,
    s.FLOUNDER_HEIGHTS,
    s.BLUEFIN_DEPOT,
    s.MINCEMEAT_METALWORKS,
    s.SHIPSHAPE_CARGO_CO,
  ],
};
