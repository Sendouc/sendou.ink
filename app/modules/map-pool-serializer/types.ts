import type { ModeShort } from "../in-game-lists";
import type { StageId } from "../in-game-lists";

// xxx: rename - same name as DB table
export type MapPool = Record<ModeShort, StageId[]>;
