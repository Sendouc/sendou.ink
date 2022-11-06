import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import type { ModeWithStage, StageId } from "../in-game-lists";
import { rankedModesShort } from "../in-game-lists/modes";
import type { TournamentMaplistInput } from "./types";

export function createTournamentMapList({
  teams,
  bestOf,
  tiebreakerMaps,
}: TournamentMaplistInput) {
  const result: ModeWithStage[] = [];

  const stagesUsed = new Set<StageId>();
  const modesOrder = shuffle(rankedModesShort);

  // xxx: order by name
  const teamOneMaps = shuffle(teams[0].maps.stageModePairs);
  const teamTwoMaps = shuffle(teams[1].maps.stageModePairs);

  for (let i = 0; i < bestOf; i++) {
    const modeOfThisRound = modesOrder.shift()!;
    modesOrder.push(modeOfThisRound);

    if (i === bestOf - 1) {
      const lastMap = tiebreakerMaps.stageModePairs.find(
        ({ mode }) => mode === modeOfThisRound
      );
      invariant(lastMap, "Tiebreaker map not found");

      result.push(lastMap);
      break;
    }

    let found = false;
    const maps = i % 2 === 0 ? teamOneMaps : teamTwoMaps;

    console.log({ maps, modeOfThisRound });
    for (const { mode, stageId } of maps) {
      if (mode === modeOfThisRound /*&& !stagesUsed.has(stageId)*/) {
        stagesUsed.add(stageId);
        result.push({ mode, stageId });
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error("No map found from team map list");
    }
  }

  return result;
}
