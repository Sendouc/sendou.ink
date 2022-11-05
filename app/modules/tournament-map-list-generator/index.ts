import type { ModeWithStage } from "../in-game-lists";
import type { TournamentMaplistInput } from "./types";

export function createTournamentMapList(
  input: TournamentMaplistInput
): ModeWithStage[] {
  return input ? [] : [];
}
