import type { abilityCodes } from "./abilities";
import type { modes } from "./modes";
import type { stages } from "./stages";

export type ModeShort = typeof modes[number]["short"];

export type Stage = typeof stages[number];

export type Ability = typeof abilityCodes[number]["name"];
export type AbilityWithUnknown =
  | typeof abilityCodes[number]["name"]
  | "UNKNOWN";
export type AbilityType = typeof abilityCodes[number]["type"];
