import invariant from "tiny-invariant";
import type { ModeShort, ModeWithStage, StageId } from "../in-game-lists";
import { rankedModesShort } from "../in-game-lists/modes";
import { DEFAULT_MAP_POOL } from "./constants";
import type { TournamentMaplistInput } from "./types";
import { seededRandom } from "./utils";

export function createTournamentMapList({
  bracketType,
  roundNumber,
  bestOf,
  ...rest
}: TournamentMaplistInput) {
  const modesOrder = seededShuffle({
    bracketType,
    roundNumber,
    seedId: "mode",
  })(rankedModesShort);

  // startingMode will be the mode used in tiebreaker
  for (const startingMode of modesOrder) {
    const list = equalNoStageRepeatStrategy({
      ...rest,
      bestOf,
      bracketType,
      roundNumber,
      modesOrder: resolveModesOrder({
        bracketType,
        roundNumber,
        startingMode,
        bestOf,
      }),
    });

    if (list) return list;
  }

  // strat that allows duplicate maps (map on both teams list)
  // redo equalNoStageRepeatStrategy with default map list

  throw new Error("should not get here");
}

function seededShuffle({
  bracketType,
  roundNumber,
  seedId,
}: Pick<TournamentMaplistInput, "bracketType" | "roundNumber"> & {
  seedId: string;
}) {
  const { shuffle } = seededRandom(`${bracketType}-${roundNumber}-${seedId}`);

  return shuffle;
}

function resolveModesOrder({
  startingMode,
  bracketType,
  roundNumber,
  bestOf,
}: {
  startingMode: ModeShort;
  bracketType: TournamentMaplistInput["bracketType"];
  roundNumber: TournamentMaplistInput["roundNumber"];
  bestOf: TournamentMaplistInput["bestOf"];
}) {
  const result = [startingMode];

  const modes = seededShuffle({
    bracketType,
    roundNumber,
    seedId: startingMode,
  })(rankedModesShort.filter((mode) => mode !== startingMode));
  modes.push(startingMode);

  while (result.length < bestOf) {
    const nextMode = modes.shift()!;
    result.push(nextMode);
    modes.push(nextMode);
  }

  return result.reverse();
}

function equalNoStageRepeatStrategy({
  teams,
  bestOf,
  tiebreakerMaps,
  bracketType,
  roundNumber,
  modesOrder,
}: TournamentMaplistInput & { modesOrder: ModeShort[] }) {
  const result: ModeWithStage[] = [];

  // let's already mark tiebreaker stage as used so we don't use it in regular maps and "fail the run"
  const tiebreakerStageId = tiebreakerMaps.stageModePairs.find(
    (pair) => pair.mode === modesOrder[modesOrder.length - 1]
  )!.stageId;
  const stagesUsed = new Set<StageId>([tiebreakerStageId]);

  const teamsSortedByName = teams.sort((a, b) => a.name.localeCompare(b.name));
  const teamOneMaps = seededShuffle({
    bracketType,
    roundNumber,
    seedId: "teamOne",
  })(teamsSortedByName[0].maps.stageModePairs);
  const teamTwoMaps = seededShuffle({
    bracketType,
    roundNumber,
    seedId: "teamTwo",
  })(teamsSortedByName[1].maps.stageModePairs);

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

    for (const { mode, stageId } of resolveTeamMapPoolToUse({
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
      return null;
    }
  }

  if (isUnfair({ maybeResult: result, teams })) {
    return null;
  }

  return result;
}

function resolveTeamMapPoolToUse({
  teamOneMaps,
  teamTwoMaps,
  index,
}: {
  index: number;
  teamOneMaps: { mode: ModeShort; stageId: StageId }[];
  teamTwoMaps: { mode: ModeShort; stageId: StageId }[];
}) {
  if (teamOneMaps.length === 0 && teamTwoMaps.length === 0) {
    return DEFAULT_MAP_POOL.stageModePairs;
  }
  if (teamOneMaps.length === 0) return teamTwoMaps;
  if (teamTwoMaps.length === 0) return teamOneMaps;

  return index % 2 === 0 ? teamOneMaps : teamTwoMaps;
}

function isUnfair({
  maybeResult,
  teams,
}: {
  maybeResult: ModeWithStage[];
  teams: TournamentMaplistInput["teams"];
}) {
  let teamOneCount = 0;
  let teamTwoCount = 0;

  if (teams[0].maps.stages.length === 0 || teams[1].maps.stages.length === 0) {
    return false;
  }

  for (const { mode, stageId } of maybeResult) {
    if (teams[0].maps.has({ mode, stageId })) teamOneCount++;
    if (teams[1].maps.has({ mode, stageId })) teamTwoCount++;
  }

  return teamOneCount !== teamTwoCount;
}
