import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stagesObj as s } from "~/modules/in-game-lists/stage-ids";

export const BANNED_MAPS: Record<ModeShort, StageId[]> = {
	TW: [],
	SZ: [],
	TC: [
		s.WAHOO_WORLD,
		s.FLOUNDER_HEIGHTS,
		s.BRINEWATER_SPRINGS,
		s.SCORCH_GORGE,
		s.MAHI_MAHI_RESORT,
		s.MINCEMEAT_METALWORKS,
		s.HUMPBACK_PUMP_TRACK,
		s.BLUEFIN_DEPOT,
		s.CRABLEG_CAPITAL,
	],
	RM: [
		s.EELTAIL_ALLEY,
		s.WAHOO_WORLD,
		s.BRINEWATER_SPRINGS,
		s.BLUEFIN_DEPOT,
		s.STURGEON_SHIPYARD,
		s.INKBLOT_ART_ACADEMY,
		s.SHIPSHAPE_CARGO_CO,
		s.MAHI_MAHI_RESORT,
		s.MARLIN_AIRPORT,
	],
	CB: [
		s.HAMMERHEAD_BRIDGE,
		s.STURGEON_SHIPYARD,
		s.WAHOO_WORLD,
		s.FLOUNDER_HEIGHTS,
		s.MINCEMEAT_METALWORKS,
		s.SHIPSHAPE_CARGO_CO,
		s.EELTAIL_ALLEY,
		s.UNDERTOW_SPILLWAY,
	],
};
