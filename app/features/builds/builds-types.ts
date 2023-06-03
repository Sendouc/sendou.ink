import type { Ability } from "~/modules/in-game-lists";

export interface BuildFilter {
  id: string;
  ability: Ability;
  /** Ability points value or "has"/"doesn't have" */
  value?: number | boolean;
  comparison: "AT_LEAST" | "AT_MOST";
}
