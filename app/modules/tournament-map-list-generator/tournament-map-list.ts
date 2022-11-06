import invariant from "tiny-invariant";
import type { ModeShort, ModeWithStage, StageId } from "../in-game-lists";
import { rankedModesShort } from "../in-game-lists/modes";
import type { TournamentMaplistInput } from "./types";
import { seededRandom } from "./utils";

export function createTournamentMapList({
  teams,
  bestOf,
  tiebreakerMaps,
  bracketType,
  roundNumber,
}: TournamentMaplistInput) {
  const result: ModeWithStage[] = [];

  const seededShuffle = (seedPart: string) => {
    const { shuffle } = seededRandom(
      `${bracketType}-${roundNumber}-${seedPart}`
    );

    return shuffle;
  };

  const stagesUsed = new Set<StageId>();
  const modesOrder = seededShuffle("modes")(rankedModesShort);

  const teamsSortedByName = teams.sort((a, b) => a.name.localeCompare(b.name));
  const teamOneMaps = seededShuffle("teamOne")(
    teamsSortedByName[0].maps.stageModePairs
  );
  const teamTwoMaps = seededShuffle("teamTwo")(
    teamsSortedByName[1].maps.stageModePairs
  );

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

    for (const { mode, stageId } of resolveMapList({
      index: i,
      teamOneMaps,
      teamTwoMaps,
    })) {
      if (mode === modeOfThisRound && !stagesUsed.has(stageId)) {
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

function resolveMapList({
  teamOneMaps,
  teamTwoMaps,
  index,
}: {
  index: number;
  teamOneMaps: { mode: ModeShort; stageId: StageId }[];
  teamTwoMaps: { mode: ModeShort; stageId: StageId }[];
}) {
  if (teamOneMaps.length === 0) return teamTwoMaps;
  if (teamTwoMaps.length === 0) return teamOneMaps;

  return index % 2 === 0 ? teamOneMaps : teamTwoMaps;
}
