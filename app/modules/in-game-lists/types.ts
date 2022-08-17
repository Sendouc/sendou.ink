import type { modes } from "./modes";
import type { stages } from "./stages";

export type ModeShort = typeof modes[number]["short"];

export type Stage = typeof stages[number];
